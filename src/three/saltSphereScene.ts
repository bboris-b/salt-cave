import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { SIMPLEX_NOISE_3D } from './simplexNoiseChunk'

const SALT_PINK = 0xd4967a
const SALT_GLOW = 0xf0d4b8
const AMBIENT_HEX = 0x1a1812

export type SaltSceneParams = {
  /** Icosahedron detail 3–5 */
  detail: number
  enableBloom: boolean
}

export type SaltSceneFrameState = {
  /** 0–1 RMS-ish microphone envelope */
  rms: number
  /** Multiplies idle breathing speed; <1 slows toward result */
  breathSpeed: number
  /** 0 intro → 1 result: warms light & emissive bias */
  warmth: number
  /** Entrance: mesh scale multiplier (animated outside or 1) */
  sphereScale: number
  /** 0–1 sphere opacity */
  sphereOpacity: number
}

export type SaltSceneAPI = {
  readonly domElement: HTMLCanvasElement
  setSize(width: number, height: number): void
  setState(s: SaltSceneFrameState): void
  /** Starts vertex burst; calls onDone when fade stabilizes */
  startDissolve(onDone: () => void): void
  dispose(): void
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function shouldUseCssFallback(): boolean {
  if (prefersReducedMotion()) return true
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    return !gl
  } catch {
    return true
  }
}

export function recommendedIcosaDetail(): number {
  const w = typeof window !== 'undefined' ? window.innerWidth : 400
  const lowCores =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4
  if (w < 420 || lowCores) return 3
  if (w < 900) return 4
  return 5
}

export function createSaltSphereScene(
  container: HTMLElement,
  params: SaltSceneParams,
): SaltSceneAPI {
  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
  camera.position.set(0, 0.15, 2.6)

  const ambient = new THREE.AmbientLight(AMBIENT_HEX, 0.14)
  scene.add(ambient)

  const keyLight = new THREE.PointLight(SALT_GLOW, 1.25, 12, 2)
  keyLight.position.set(0.9, 1.4, 2.2)
  scene.add(keyLight)

  const rim = new THREE.DirectionalLight(0xe8c4a0, 0.22)
  rim.position.set(-2.2, 0.4, 1.5)
  scene.add(rim)

  const geo = new THREE.IcosahedronGeometry(0.95, params.detail)
  geo.computeVertexNormals()

  const uniforms = {
    uTime: { value: 0 },
    uNoiseAmp: { value: 0.055 },
    uAudioDisp: { value: 0 },
    uBreathSpeed: { value: 1 },
  }

  const mat = new THREE.MeshStandardMaterial({
    color: SALT_PINK,
    roughness: 0.7,
    metalness: 0.1,
    emissive: new THREE.Color(SALT_GLOW),
    emissiveIntensity: 0.12,
  })

  mat.onBeforeCompile = (shader: {
    uniforms: Record<string, THREE.IUniform>
    vertexShader: string
    fragmentShader: string
  }) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader =
      `
      uniform float uTime;
      uniform float uNoiseAmp;
      uniform float uAudioDisp;
      uniform float uBreathSpeed;
      ${SIMPLEX_NOISE_3D}
      ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float n = snoise(vec3(position * 2.15) + vec3(0.0, uTime * 0.12 * uBreathSpeed, uTime * 0.09 * uBreathSpeed));
      float breath = sin(uTime * 0.62 * uBreathSpeed) * uNoiseAmp * 0.42;
      float organic = n * uNoiseAmp;
      float disp = organic + breath + uAudioDisp;
      transformed += normal * disp;
      `,
    )
  }

  mat.customProgramCacheKey = () => 'salt-cave-displace'

  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = false
  mesh.receiveShadow = false
  scene.add(mesh)

  let composer: EffectComposer | null = null

  if (params.enableBloom) {
    composer = new EffectComposer(renderer)
    const rp = new RenderPass(scene, camera)
    composer.addPass(rp)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.3, 0.5, 0.35)
    composer.addPass(bloomPass)
    const outputPass = new OutputPass()
    composer.addPass(outputPass)
  }

  let running = true
  let elapsed = 0
  let state: SaltSceneFrameState = {
    rms: 0,
    breathSpeed: 1,
    warmth: 0,
    sphereScale: 1,
    sphereOpacity: 1,
  }

  let dissolveActive = false
  let dissolveT = 0
  let dissolveCallback: (() => void) | null = null
  let points: THREE.Points | null = null
  let particleGeom: THREE.BufferGeometry | null = null
  let particlePos: Float32Array | null = null
  let particleVel: Float32Array | null = null
  let particleLife: Float32Array | null = null

  const clock = new THREE.Clock()

  function buildParticlesFromMesh(): void {
    const g = mesh.geometry as THREE.BufferGeometry
    const attr = g.getAttribute('position') as THREE.BufferAttribute
    const n = attr.count
    const pos = new Float32Array(n * 3)
    const vel = new Float32Array(n * 3)
    const life = new Float32Array(n)
    const m = new THREE.Matrix4()
    mesh.updateWorldMatrix(true, false)
    m.copy(mesh.matrixWorld)
    const v = new THREE.Vector3()
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(attr, i)
      v.applyMatrix4(m)
      pos[i * 3] = v.x
      pos[i * 3 + 1] = v.y
      pos[i * 3 + 2] = v.z
      const rx = (Math.random() - 0.5) * 1.6
      const ry = Math.random() * 0.9 + 0.2
      const rz = (Math.random() - 0.5) * 1.6
      vel[i * 3] = rx * 0.35
      vel[i * 3 + 1] = ry * 0.45
      vel[i * 3 + 2] = rz * 0.35
      life[i] = 0.6 + Math.random() * 0.8
    }
    particlePos = pos
    particleVel = vel
    particleLife = life
    particleGeom = new THREE.BufferGeometry()
    particleGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const pMat = new THREE.PointsMaterial({
      color: SALT_PINK,
      size: params.detail >= 4 ? 0.028 : 0.034,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    points = new THREE.Points(particleGeom, pMat)
    scene.add(points)
    mesh.visible = false
  }

  function tick(): void {
    if (!running) return
    requestAnimationFrame(tick)
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt
    uniforms.uTime.value = elapsed
    uniforms.uBreathSpeed.value = state.breathSpeed
    const r = THREE.MathUtils.clamp(state.rms * 1.15, 0, 1)
    uniforms.uAudioDisp.value = THREE.MathUtils.lerp(uniforms.uAudioDisp.value, r * 0.14, 0.12)

    const warm = THREE.MathUtils.clamp(state.warmth, 0, 1)
    keyLight.color.lerpColors(new THREE.Color(SALT_GLOW), new THREE.Color(0xffe2c8), warm * 0.35)
    keyLight.intensity = 1.15 + r * 1.1 + warm * 0.35
    mat.emissiveIntensity = THREE.MathUtils.lerp(0.1, 0.52, r) + warm * 0.08

    mesh.scale.setScalar(state.sphereScale)
    mat.opacity = state.sphereOpacity
    mat.transparent = state.sphereOpacity < 0.999

    if (dissolveActive && particlePos && particleVel && particleLife && points && particleGeom) {
      dissolveT += dt
      const g = 0.85
      const n = particleLife.length
      const settled = dissolveCallback === null && dissolveT > 2.8
      const drift = settled ? 0.08 : 1
      const grav = settled ? 0.06 : g
      for (let i = 0; i < n; i++) {
        if (!settled) {
          particleVel[i * 3 + 1] -= grav * dt * particleLife[i]
        } else {
          particleVel[i * 3] += Math.sin(elapsed * 0.31 + i * 0.1) * 0.00015
          particleVel[i * 3 + 2] += Math.cos(elapsed * 0.27 + i * 0.08) * 0.00012
          particleVel[i * 3] *= 0.985
          particleVel[i * 3 + 1] *= 0.985
          particleVel[i * 3 + 2] *= 0.985
        }
        particlePos[i * 3] += particleVel[i * 3] * dt * 2.4 * particleLife[i] * drift
        particlePos[i * 3 + 1] += particleVel[i * 3 + 1] * dt * 2.4 * particleLife[i] * drift
        particlePos[i * 3 + 2] += particleVel[i * 3 + 2] * dt * 2.4 * particleLife[i] * drift
      }
      const pa = particleGeom.getAttribute('position') as THREE.BufferAttribute
      pa.needsUpdate = true
      const pm = points.material as THREE.PointsMaterial
      const targetOp = settled ? 0.22 : THREE.MathUtils.clamp(0.2 + 0.35 * Math.exp(-dissolveT * 0.15), 0.12, 0.5)
      pm.opacity = THREE.MathUtils.lerp(pm.opacity, targetOp, 0.04)

      if (dissolveT > 2.8 && dissolveCallback) {
        const cb = dissolveCallback
        dissolveCallback = null
        cb()
      }
    }

    if (composer) {
      composer.render()
    } else {
      renderer.render(scene, camera)
    }
  }

  tick()

  container.appendChild(renderer.domElement)

  const api: SaltSceneAPI = {
    domElement: renderer.domElement,
    setSize(w: number, h: number) {
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (composer) composer.setSize(w, h)
    },
    setState(s: SaltSceneFrameState) {
      state = s
    },
    startDissolve(onDone: () => void) {
      if (dissolveActive) return
      dissolveActive = true
      dissolveT = 0
      dissolveCallback = onDone
      buildParticlesFromMesh()
    },
    dispose() {
      running = false
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
      geo.dispose()
      mat.dispose()
      if (particleGeom) particleGeom.dispose()
      if (points) {
        ;(points.material as THREE.Material).dispose()
        scene.remove(points)
      }
      renderer.dispose()
      composer = null
    },
  }

  return api
}
