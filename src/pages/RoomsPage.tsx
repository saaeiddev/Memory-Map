import { Box, Sparkles } from 'lucide-react'
import type { Memory } from '../types'

export function RoomsPage({ memories, onEnter }: { memories: Memory[]; onEnter: (m: Memory) => void }) {
  return (
    <section className="page-shell rooms-page">
      <div className="page-heading"><div><span className="eyebrow">Immersive memories</span><h1>Memory Rooms</h1><p>Step inside a moment instead of only looking at it.</p></div><span className="heading-count"><Box size={15}/>{memories.length} rooms</span></div>
      <div className="rooms-grid">
        {memories.map(memory => {
          const hero=memory.media.find(m=>m.type==='image')?.url
          return <button key={memory.id} className="room-card" onClick={()=>onEnter(memory)} style={hero?{backgroundImage:`linear-gradient(180deg, transparent 20%, rgba(5,9,15,.92)), url(${hero})`}:undefined}>
            <span className="room-card__orb"><Sparkles size={17}/></span>
            <div><span>{memory.emotion} room</span><h2>{memory.title}</h2><p>{memory.city} · {new Date(memory.memoryDate).getFullYear()}</p></div>
          </button>
        })}
      </div>
    </section>
  )
}
