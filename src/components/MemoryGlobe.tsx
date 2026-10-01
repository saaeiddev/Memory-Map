import { Html, Line, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import type { Memory } from '../types'
import { latLngToVector3 } from '../utils/geo'

interface Cluster {
  key: string
  city: string
  country: string
  latitude: number
  longitude: number
  memories: Memory[]
}

function createClusters(memories: Memory[]): Cluster[] {
  const map = new Map<string, Cluster>()
  memories.forEach(memory => {
    const key = `${memory.city}|${memory.country}`
    const existing = map.get(key)
    if (existing) existing.memories.push(memory)
    else map.set(key, { key, city: memory.city, country: memory.country, latitude: memory.latitude, longitude: memory.longitude, memories: [memory] })
  })
  return [...map.values()]
}

function MemoryPin({ cluster, onSelect }: { cluster: Cluster; onSelect: (memory: Memory) => void }) {
  const [hovered, setHovered] = useState(false)
  const p = useMemo(() => latLngToVector3(cluster.latitude, cluster.longitude, 1.035), [cluster.latitude, cluster.longitude])
  const size = cluster.memories.length > 1 ? 0.028 : 0.021
  return (
    <group position={p}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(cluster.memories[0]) }}
      >
        <sphereGeometry args={[size, 20, 20]} />
        <meshBasicMaterial color="#f8c86d" toneMapped={false} />
      </mesh>
      <mesh scale={hovered ? 1.7 : 1.35}>
        <sphereGeometry args={[size * 1.55, 16, 16]} />
        <meshBasicMaterial color="#f4b24e" transparent opacity={0.17} toneMapped={false} />
      </mesh>
      {(hovered || cluster.memories.length > 1) && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="globe-label">
            <strong>{cluster.city}</strong>
            <span>{cluster.memories.length} {cluster.memories.length === 1 ? 'memory' : 'memories'}</span>
          </div>
        </Html>
      )}
    </group>
  )
}

function Route({ a, b }: { a: Memory; b: Memory }) {
  const points = useMemo(() => {
    const start = latLngToVector3(a.latitude, a.longitude, 1.04)
    const end = latLngToVector3(b.latitude, b.longitude, 1.04)
    const mid = start.clone().add(end).multiplyScalar(.5).normalize().multiplyScalar(1.18)
    return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(40)
  }, [a, b])
  return <Line points={points} color="#76b7ff" transparent opacity={0.35} lineWidth={0.8} />
}

function GlobeScene({ memories, onSelect, reducedMotion }: { memories: Memory[]; onSelect: (m: Memory) => void; reducedMotion: boolean }) {
  const globeRef = useRef<Group>(null)
  const clusters = useMemo(() => createClusters(memories), [memories])
  const ordered = useMemo(() => [...memories].sort((a,b) => a.memoryDate.localeCompare(b.memoryDate)), [memories])

  useFrame((_, delta) => {
    if (!reducedMotion && globeRef.current) globeRef.current.rotation.y += delta * 0.022
  })

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 2, 5]} intensity={2.4} color="#a9cdfd" />
      <pointLight position={[-4, -1, -4]} intensity={2.2} color="#8b6de8" />
      <Stars radius={50} depth={40} count={900} factor={2} saturation={0} fade speed={0.2} />
      <group ref={globeRef} rotation={[0.08, -0.45, 0]}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial color="#0b2030" roughness={0.68} metalness={0.08} emissive="#06131d" emissiveIntensity={0.45} />
        </mesh>
        <mesh scale={1.018}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color="#58a6d8" wireframe transparent opacity={0.07} />
        </mesh>
        <mesh scale={1.055}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial color="#6aaef4" transparent opacity={0.035} side={THREE.BackSide} />
        </mesh>
        {clusters.map(cluster => <MemoryPin key={cluster.key} cluster={cluster} onSelect={onSelect} />)}
        {ordered.slice(0, -1).map((memory, index) => <Route key={`${memory.id}-${ordered[index+1].id}`} a={memory} b={ordered[index+1]} />)}
      </group>
      <OrbitControls enablePan={false} minDistance={2.1} maxDistance={4.4} enableDamping dampingFactor={0.06} rotateSpeed={0.52} zoomSpeed={0.65} />
    </>
  )
}

export function MemoryGlobe({ memories, onSelect, reducedMotion = false }: { memories: Memory[]; onSelect: (m: Memory) => void; reducedMotion?: boolean }) {
  return (
    <div className="globe-canvas" role="application" aria-label="Interactive 3D memory globe">
      <Canvas camera={{ position: [0, 0.1, 2.75], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <GlobeScene memories={memories} onSelect={onSelect} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
