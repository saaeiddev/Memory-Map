import { Html, Line, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState, type ReactNode } from 'react'
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

interface AnchorPoint {
  latitude: number
  longitude: number
}

const LANDMASSES = [
  { latitude: 48, longitude: -105, scale: [0.44, 0.14, 0.28] as [number, number, number], color: '#91d285' },
  { latitude: 13, longitude: -94, scale: [0.16, 0.09, 0.12] as [number, number, number], color: '#9cd78b' },
  { latitude: -17, longitude: -60, scale: [0.28, 0.13, 0.19] as [number, number, number], color: '#7fc772' },
  { latitude: 53, longitude: 15, scale: [0.33, 0.12, 0.22] as [number, number, number], color: '#a8db88' },
  { latitude: 8, longitude: 22, scale: [0.25, 0.16, 0.18] as [number, number, number], color: '#95d17d' },
  { latitude: 33, longitude: 88, scale: [0.34, 0.15, 0.23] as [number, number, number], color: '#9ed685' },
  { latitude: -24, longitude: 134, scale: [0.21, 0.11, 0.16] as [number, number, number], color: '#86cc78' },
  { latitude: 67, longitude: -42, scale: [0.13, 0.06, 0.12] as [number, number, number], color: '#b4e39a' },
  { latitude: 36, longitude: 138, scale: [0.07, 0.035, 0.06] as [number, number, number], color: '#b6e79b' },
  { latitude: -41, longitude: 174, scale: [0.07, 0.03, 0.06] as [number, number, number], color: '#9fd08d' }
]

const CLOUDS: AnchorPoint[] = [
  { latitude: 58, longitude: -150 },
  { latitude: 24, longitude: -18 },
  { latitude: 8, longitude: 120 },
  { latitude: -8, longitude: 64 },
  { latitude: -28, longitude: -128 },
  { latitude: -44, longitude: 18 },
  { latitude: 64, longitude: 72 }
]

const TREES: AnchorPoint[] = [
  { latitude: 42, longitude: -122 },
  { latitude: 47, longitude: 14 },
  { latitude: 28, longitude: 80 },
  { latitude: -22, longitude: 133 },
  { latitude: -14, longitude: -58 }
]

const HOUSES: AnchorPoint[] = [
  { latitude: 41, longitude: -74 },
  { latitude: 51, longitude: 0 },
  { latitude: 35, longitude: 139 },
  { latitude: -23, longitude: -46 }
]

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

function makeOrientation(position: THREE.Vector3) {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize())
}

function SurfaceAnchor({ latitude, longitude, radius, children }: AnchorPoint & { radius: number; children: ReactNode }) {
  const position = useMemo(() => latLngToVector3(latitude, longitude, radius), [latitude, longitude, radius])
  const quaternion = useMemo(() => makeOrientation(position), [position])
  return <group position={position} quaternion={quaternion}>{children}</group>
}

function CozyEarthModel() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshPhysicalMaterial color="#4277b8" roughness={0.82} metalness={0.02} clearcoat={0.18} clearcoatRoughness={0.5} emissive="#153452" emissiveIntensity={0.28} />
      </mesh>

      <mesh scale={1.01}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial color="#5d8fd0" transparent opacity={0.18} emissive="#4fa6d9" emissiveIntensity={0.12} />
      </mesh>

      {LANDMASSES.map((land, index) => (
        <SurfaceAnchor key={`land-${index}`} latitude={land.latitude} longitude={land.longitude} radius={1.005}>
          <mesh scale={land.scale} rotation={[0.18 * (index % 2), index * 0.4, 0.08 * ((index % 3) - 1)]}>
            <sphereGeometry args={[1, 36, 36]} />
            <meshStandardMaterial color={land.color} roughness={0.92} metalness={0.01} emissive={land.color} emissiveIntensity={0.08} />
          </mesh>
        </SurfaceAnchor>
      ))}

      {TREES.map((tree, index) => (
        <SurfaceAnchor key={`tree-${index}`} latitude={tree.latitude} longitude={tree.longitude} radius={1.07}>
          <group rotation={[0, index * 0.8, 0]}>
            <mesh position={[0, 0.028, 0]}>
              <cylinderGeometry args={[0.008, 0.011, 0.06, 8]} />
              <meshStandardMaterial color="#7d4d37" roughness={1} />
            </mesh>
            <mesh position={[0, 0.082, 0]}>
              <coneGeometry args={[0.038, 0.09, 10]} />
              <meshStandardMaterial color="#7bc88f" roughness={0.95} emissive="#4fa96e" emissiveIntensity={0.09} />
            </mesh>
          </group>
        </SurfaceAnchor>
      ))}

      {HOUSES.map((house, index) => (
        <SurfaceAnchor key={`house-${index}`} latitude={house.latitude} longitude={house.longitude} radius={1.075}>
          <group rotation={[0, index * 0.55, 0]}>
            <mesh position={[0, 0.028, 0]}>
              <boxGeometry args={[0.064, 0.052, 0.058]} />
              <meshStandardMaterial color="#f2edd9" roughness={0.96} />
            </mesh>
            <mesh position={[0, 0.071, 0]}>
              <coneGeometry args={[0.052, 0.05, 4]} />
              <meshStandardMaterial color="#d07d63" roughness={0.92} emissive="#b55a44" emissiveIntensity={0.08} />
            </mesh>
            <mesh position={[0, 0.024, 0.031]}>
              <planeGeometry args={[0.018, 0.018]} />
              <meshBasicMaterial color="#ffd98d" toneMapped={false} />
            </mesh>
          </group>
        </SurfaceAnchor>
      ))}

      {CLOUDS.map((cloud, index) => (
        <SurfaceAnchor key={`cloud-${index}`} latitude={cloud.latitude} longitude={cloud.longitude} radius={1.13}>
          <group rotation={[0.22, index * 0.7, 0.16]}>
            <mesh position={[-0.055, 0, 0]}>
              <sphereGeometry args={[0.05, 18, 18]} />
              <meshStandardMaterial color="#f7fbff" roughness={1} emissive="#ffffff" emissiveIntensity={0.05} />
            </mesh>
            <mesh position={[0, 0.016, 0.015]}>
              <sphereGeometry args={[0.067, 18, 18]} />
              <meshStandardMaterial color="#f8fcff" roughness={1} emissive="#ffffff" emissiveIntensity={0.07} />
            </mesh>
            <mesh position={[0.06, -0.002, -0.01]}>
              <sphereGeometry args={[0.048, 18, 18]} />
              <meshStandardMaterial color="#f5fbff" roughness={1} emissive="#ffffff" emissiveIntensity={0.05} />
            </mesh>
          </group>
        </SurfaceAnchor>
      ))}

      <mesh scale={1.18}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#8fd7ff" transparent opacity={0.085} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function MemoryPin({ cluster, onSelect }: { cluster: Cluster; onSelect: (memory: Memory) => void }) {
  const [hovered, setHovered] = useState(false)
  const p = useMemo(() => latLngToVector3(cluster.latitude, cluster.longitude, 1.18), [cluster.latitude, cluster.longitude])
  const size = cluster.memories.length > 1 ? 0.03 : 0.022
  return (
    <group position={p}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(cluster.memories[0]) }}
      >
        <sphereGeometry args={[size, 20, 20]} />
        <meshBasicMaterial color="#ffd98d" toneMapped={false} />
      </mesh>
      <mesh scale={hovered ? 1.95 : 1.55}>
        <sphereGeometry args={[size * 1.45, 16, 16]} />
        <meshBasicMaterial color="#ffc86f" transparent opacity={0.22} toneMapped={false} />
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
    const start = latLngToVector3(a.latitude, a.longitude, 1.19)
    const end = latLngToVector3(b.latitude, b.longitude, 1.19)
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.34)
    return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(36)
  }, [a, b])

  return <Line points={points} color="#9fdbff" transparent opacity={0.44} lineWidth={1.2} />
}

function GlobeScene({ memories, onSelect, reducedMotion }: { memories: Memory[]; onSelect: (m: Memory) => void; reducedMotion: boolean }) {
  const globeRef = useRef<Group>(null)
  const clusters = useMemo(() => createClusters(memories), [memories])
  const ordered = useMemo(() => [...memories].sort((a, b) => a.memoryDate.localeCompare(b.memoryDate)), [memories])

  useFrame((_, delta) => {
    if (!reducedMotion && globeRef.current) globeRef.current.rotation.y += delta * 0.018
  })

  return (
    <>
      <color attach="background" args={['#061018']} />
      <fog attach="fog" args={['#061018', 5.5, 13.5]} />
      <ambientLight intensity={1.25} color="#fff3de" />
      <hemisphereLight args={['#f6f1e8', '#16304c', 1.15]} />
      <directionalLight position={[4, 3, 5]} intensity={2.35} color="#ffe8c8" />
      <pointLight position={[-4, -1, -4]} intensity={1.85} color="#8ec8ff" />
      <pointLight position={[0, 2.8, 2]} intensity={0.9} color="#ffd59a" />
      <Stars radius={55} depth={42} count={1000} factor={2.2} saturation={0.1} fade speed={0.26} />

      <group ref={globeRef} rotation={[0.12, -0.45, 0]}>
        <CozyEarthModel />


        {clusters.map(cluster => <MemoryPin key={cluster.key} cluster={cluster} onSelect={onSelect} />)}
        {ordered.slice(0, -1).map((memory, index) => <Route key={`${memory.id}-${ordered[index + 1].id}`} a={memory} b={ordered[index + 1]} />)}
      </group>

      <OrbitControls enablePan={false} minDistance={2.35} maxDistance={4.7} enableDamping dampingFactor={0.06} rotateSpeed={0.52} zoomSpeed={0.6} />
    </>
  )
}

export function MemoryGlobe({ memories, onSelect, reducedMotion = false }: { memories: Memory[]; onSelect: (m: Memory) => void; reducedMotion?: boolean }) {
  return (
    <div className="globe-canvas" role="application" aria-label="Interactive 3D memory globe">
      <Canvas camera={{ position: [0, 0.12, 3.05], fov: 40 }} dpr={[1, 1.7]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <GlobeScene memories={memories} onSelect={onSelect} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
