import { Compass, Search, Sparkles } from 'lucide-react'
import { MemoryGlobe } from '../components/MemoryGlobe'
import type { Memory } from '../types'

export function MapPage({ memories, onOpen, onSearch, reducedMotion }: { memories: Memory[]; onOpen: (m: Memory) => void; onSearch: () => void; reducedMotion: boolean }) {
  const latest = [...memories].sort((a,b)=>b.memoryDate.localeCompare(a.memoryDate))[0]
  return (
    <section className="map-page">
      <div className="map-stage">
        <MemoryGlobe memories={memories} onSelect={onOpen} reducedMotion={reducedMotion}/>
        <div className="map-topbar">
          <button className="search-chip" onClick={onSearch}><Search size={16}/><span>Search memories</span><kbd>⌘ K</kbd></button>
          <div className="map-stat glass-panel"><Sparkles size={15}/><span><strong>{memories.length}</strong> moments</span></div>
        </div>
        <div className="map-hint"><Compass size={15}/><span>Drag to explore · pinch to zoom · tap a memory</span></div>
        {latest && <button className="latest-memory glass-panel" onClick={()=>onOpen(latest)}>
          <span className="eyebrow">Latest memory</span><strong>{latest.title}</strong><small>{latest.city} · {new Date(latest.memoryDate).getFullYear()}</small>
        </button>}
      </div>
    </section>
  )
}
