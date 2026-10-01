import { Html, OrbitControls, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ArrowLeft, CalendarDays, MapPin, Volume2 } from 'lucide-react'
import type { Memory } from '../types'

const moodLight: Record<string, { ambient: string; key: string; floor: string }> = {
  Peaceful: { ambient: '#7fb7de', key: '#bfe8ff', floor: '#132633' },
  Romantic: { ambient: '#b86f6f', key: '#ffd19b', floor: '#2a1a20' },
  Nostalgic: { ambient: '#a88358', key: '#f5d39b', floor: '#2c241c' },
  Happy: { ambient: '#b4a059', key: '#fff0a8', floor: '#2a2718' },
  Sad: { ambient: '#64798e', key: '#97acc2', floor: '#161d24' }
}

function RoomScene({ memory }: { memory: Memory }) {
  const theme = moodLight[memory.emotion] ?? { ambient: '#7187aa', key: '#b9c6ff', floor: '#171b27' }
  const images = memory.media.filter(m => m.type === 'image').slice(0, 4)
  const positions: [number, number, number][] = [[-1.8,1.15,-2.55],[0,1.15,-2.72],[1.8,1.15,-2.55],[2.55,1.15,-.65]]
  const rotations: [number,number,number][] = [[0,.12,0],[0,0,0],[0,-.12,0],[0,-Math.PI/2,0]]

  return (
    <>
      <ambientLight intensity={1.1} color={theme.ambient} />
      <directionalLight position={[2.5,4,2]} intensity={3.2} color={theme.key} />
      <pointLight position={[-2,1.4,1]} intensity={2.5} color="#a98cff" />
      <Sparkles count={memory.emotion === 'Sad' ? 20 : 55} scale={[7,3.5,6]} size={1.2} speed={memory.emotion === 'Peaceful' ? .18 : .28} color={theme.key} opacity={0.28} />

      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.05,0]}>
        <planeGeometry args={[9,8]} />
        <meshStandardMaterial color={theme.floor} roughness={.75} metalness={.05} />
      </mesh>
      <mesh position={[0,2.15,-3]}>
        <boxGeometry args={[8,4.5,.12]} />
        <meshStandardMaterial color="#0d131c" roughness={.85} />
      </mesh>
      <mesh position={[-4,2.15,0]} rotation={[0,Math.PI/2,0]}>
        <boxGeometry args={[6,4.5,.12]} />
        <meshStandardMaterial color="#0d131c" roughness={.85} />
      </mesh>
      <mesh position={[4,2.15,0]} rotation={[0,Math.PI/2,0]}>
        <boxGeometry args={[6,4.5,.12]} />
        <meshStandardMaterial color="#0d131c" roughness={.85} />
      </mesh>

      {positions.map((pos, i) => {
        const image = images[i % Math.max(images.length, 1)]
        return (
          <group key={i} position={pos} rotation={rotations[i]}>
            <mesh>
              <boxGeometry args={[1.38,1.06,.09]} />
              <meshStandardMaterial color="#a88959" metalness={.25} roughness={.4} />
            </mesh>
            <Html transform distanceFactor={1.3} position={[0,0,.055]} style={{ pointerEvents:'none' }}>
              <div className="room-photo-frame">
                {image ? <img src={image.url} alt="Memory frame" /> : <div className="room-photo-fallback">{memory.title}</div>}
              </div>
            </Html>
          </group>
        )
      })}

      <Html transform distanceFactor={1.2} position={[0,2.72,-2.8]} style={{ pointerEvents:'none' }}>
        <div className="room-title-plate">
          <small>{memory.emotion} memory</small>
          <strong>{memory.title}</strong>
        </div>
      </Html>

      <OrbitControls enablePan={false} minDistance={2.4} maxDistance={6.2} target={[0,1,-1.2]} minPolarAngle={.65} maxPolarAngle={1.6} minAzimuthAngle={-1.25} maxAzimuthAngle={1.25} enableDamping dampingFactor={.07}/>
    </>
  )
}

export function MemoryRoom({ memory, onBack }: { memory: Memory; onBack: () => void }) {
  const audio = memory.media.find(m=>m.type==='audio')
  return (
    <div className="room-page">
      <Canvas camera={{ position:[0,1.5,4.4], fov:48 }} dpr={[1,1.6]} gl={{ antialias:true, powerPreference:'high-performance' }}>
        <RoomScene memory={memory}/>
      </Canvas>
      <div className="room-overlay">
        <button className="floating-back" onClick={onBack}><ArrowLeft size={19}/></button>
        <div className="room-info glass-panel">
          <span className="eyebrow">Memory Room</span>
          <h1>{memory.title}</h1>
          <div className="room-info__meta"><span><CalendarDays size={14}/>{new Date(memory.memoryDate).getFullYear()}</span><span><MapPin size={14}/>{memory.city}</span></div>
          {audio && <audio src={audio.url} controls aria-label="Memory audio" />}
          {!audio && <span className="room-ambient"><Volume2 size={14}/> Cinematic ambient room</span>}
        </div>
      </div>
    </div>
  )
}
