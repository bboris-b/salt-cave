'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export function buildDissolveParticleState(geo: THREE.BufferGeometry, matrixWorld: THREE.Matrix4) {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const n = pos.count
  const positions = new Float32Array(n * 3)
  const velocities = new Float32Array(n * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(matrixWorld)
    positions[i * 3] = v.x
    positions[i * 3 + 1] = v.y
    positions[i * 3 + 2] = v.z
    velocities[i * 3] = (Math.random() - 0.5) * 0.65
    velocities[i * 3 + 1] = Math.random() * 0.5 + 0.12
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.65
  }
  return { positions, velocities }
}

const BURST_SEC = 2

type Props = {
  positions: Float32Array
  velocities: Float32Array
  pointSize: number
  onBurstComplete?: () => void
}

export function DissolvedParticles({ positions, velocities, pointSize, onBurstComplete }: Props) {
  const posAttrRef = useRef<THREE.BufferAttribute>(null)
  const tStart = useRef<number | null>(null)
  const burstFired = useRef(false)
  const matRef = useRef<THREE.PointsMaterial>(null)

  useFrame((state) => {
    const attr = posAttrRef.current
    if (!attr) return
    const arr = attr.array as Float32Array
    const n = arr.length / 3
    const t = state.clock.elapsedTime
    if (tStart.current === null) tStart.current = t
    const elapsed = t - tStart.current
    const dt = Math.min(state.clock.getDelta(), 0.05)
    const settled = elapsed >= BURST_SEC

    if (settled && !burstFired.current) {
      burstFired.current = true
      onBurstComplete?.()
    }

    const g = 0.82
    for (let i = 0; i < n; i++) {
      const ix = i * 3
      if (!settled) {
        velocities[ix + 1] -= g * dt
        arr[ix] += velocities[ix] * dt * 2.2
        arr[ix + 1] += velocities[ix + 1] * dt * 2.2
        arr[ix + 2] += velocities[ix + 2] * dt * 2.2
      } else {
        velocities[ix] += Math.sin(t * 0.33 + i * 0.07) * 0.00012
        velocities[ix + 2] += Math.cos(t * 0.29 + i * 0.05) * 0.0001
        velocities[ix] *= 0.988
        velocities[ix + 1] *= 0.988
        velocities[ix + 2] *= 0.988
        arr[ix] += velocities[ix] * dt
        arr[ix + 1] += velocities[ix + 1] * dt
        arr[ix + 2] += velocities[ix + 2] * dt
      }
    }
    attr.needsUpdate = true

    const m = matRef.current
    if (m) {
      const targetOp = settled ? 0.2 : Math.max(0.12, 0.5 - elapsed * 0.12)
      m.opacity = THREE.MathUtils.lerp(m.opacity, targetOp, 0.06)
    }
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#D4967A"
        size={pointSize}
        transparent
        opacity={0.48}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
