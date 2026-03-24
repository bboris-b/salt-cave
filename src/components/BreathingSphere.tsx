'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import type { MutableRefObject } from 'react'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import simplexChunk from '@/shaders/simplexNoise3D.glsl'
import dispChunk from '@/shaders/breathDisplacement.glsl'
import { buildDissolveParticleState, DissolvedParticles } from '@/components/ParticleTransition'

function FpsWatch({ onLowFps }: { onLowFps: () => void }) {
  const acc = useRef({ frames: 0, time: 0 })
  useFrame((_, dt) => {
    acc.current.frames++
    acc.current.time += dt
    if (acc.current.time >= 2) {
      const fps = acc.current.frames / acc.current.time
      if (fps < 24) onLowFps()
      acc.current = { frames: 0, time: 0 }
    }
  })
  return null
}

export type BreathingSphereProps = {
  /** RMS lisciato 0–1, aggiornato fuori da React (ref + RAF) */
  rmsRef: MutableRefObject<number>
  micReactive: boolean
  detail: number
  bloom: boolean
  entrance: number
  dissolveVersion: number
  resultWarm: boolean
  onFpsLow: () => void
  onDissolveBurstEnd?: () => void
}

function Scene({
  rmsRef,
  micReactive,
  detail,
  bloom,
  entrance,
  dissolveVersion,
  resultWarm,
  onFpsLow,
  onDissolveBurstEnd,
}: BreathingSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uNoiseAmp: { value: 0.052 },
    uIdleBreathAmp: { value: 0.026 },
    uAudioDisp: { value: 0 },
  })
  const [dissolved, setDissolved] = useState(false)
  const [particleData, setParticleData] = useState<{
    positions: Float32Array
    velocities: Float32Array
  } | null>(null)
  const lastDissolveV = useRef(0)
  const dispTarget = useRef(0)
  const patchedDetail = useRef<number | null>(null)

  useLayoutEffect(() => {
    const mat = matRef.current
    if (!mat) return
    if (patchedDetail.current === detail && mat.userData.saltPatched) return
    patchedDetail.current = detail
    mat.userData.saltPatched = true
    const uniforms = uniformsRef.current
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms)
      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uNoiseAmp;
        uniform float uIdleBreathAmp;
        uniform float uAudioDisp;
        ` +
        simplexChunk +
        '\n' +
        shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n${dispChunk}`)
    }
    mat.customProgramCacheKey = () => `salt-${detail}`
    mat.needsUpdate = true
  }, [detail])

  useEffect(() => {
    if (dissolveVersion <= 0 || dissolveVersion === lastDissolveV.current) return
    lastDissolveV.current = dissolveVersion
    const mesh = meshRef.current
    if (!mesh) return
    mesh.updateWorldMatrix(true, false)
    const geo = mesh.geometry as THREE.BufferGeometry
    setParticleData(buildDissolveParticleState(geo, mesh.matrixWorld))
    setDissolved(true)
  }, [dissolveVersion])

  useFrame((state) => {
    const rms = rmsRef.current
    const t = state.clock.elapsedTime
    const u = uniformsRef.current
    u.uTime.value = t

    const target = micReactive ? rms * 0.14 : rms * 0.02
    dispTarget.current += (target - dispTarget.current) * 0.12
    u.uAudioDisp.value = dispTarget.current

    const mat = matRef.current
    if (mat) {
      const base = 0.1
      const peak = 0.5
      const w = resultWarm ? 0.08 : 0
      mat.emissiveIntensity = base + rms * (peak - base) * (micReactive ? 1 : 0.35) + w
    }

    const L = lightRef.current
    if (L) {
      L.intensity = 1.15 + rms * (micReactive ? 1.05 : 0.25) + (resultWarm ? 0.25 : 0)
      if (resultWarm) L.color.lerpColors(new THREE.Color(0xf0d4b8), new THREE.Color(0xffe8d0), 0.35)
      else L.color.set(0xf0d4b8)
    }

    const mesh = meshRef.current
    if (mesh && !dissolved && mat) {
      const e = Math.min(1, Math.max(0, entrance))
      const ease = 1 - (1 - e) ** 3
      const s = 0.5 + 0.5 * ease
      mesh.scale.setScalar(s)
      mat.opacity = ease
      mat.transparent = ease < 0.999
    }
  })

  const pointSize = detail >= 4 ? 0.024 : 0.032

  return (
    <>
      <ambientLight color="#1a1812" intensity={0.15} />
      <pointLight ref={lightRef} color="#f0d4b8" intensity={1.2} position={[0.9, 1.4, 2.2]} distance={12} decay={2} />
      <directionalLight color="#e8c4a0" intensity={0.22} position={[-2.2, 0.4, 1.5]} />

      {dissolved && particleData ? (
        <DissolvedParticles
          positions={particleData.positions}
          velocities={particleData.velocities}
          pointSize={pointSize}
          onBurstComplete={onDissolveBurstEnd}
        />
      ) : (
        <mesh ref={meshRef} key={detail}>
          <icosahedronGeometry args={[0.92, detail]} />
          <meshStandardMaterial
            ref={matRef}
            color="#d4967a"
            roughness={0.7}
            metalness={0.1}
            emissive="#f0d4b8"
            emissiveIntensity={0.12}
          />
        </mesh>
      )}

      {bloom && !dissolved && (
        <Suspense fallback={null}>
          <EffectComposer>
            <Bloom intensity={0.3} luminanceThreshold={0.32} mipmapBlur radius={0.5} />
          </EffectComposer>
        </Suspense>
      )}

      <FpsWatch onLowFps={onFpsLow} />
    </>
  )
}

export function BreathingSphere(props: BreathingSphereProps) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={[1, 2]}
      camera={{ position: [0, 0.12, 2.65], fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Scene {...props} />
    </Canvas>
  )
}
