import { CalendarDays, Heart, MapPin } from 'lucide-react'
import type { Memory } from '../types'

export function MemoryCard({ memory, onOpen, compact = false }: { memory: Memory; onOpen: (m: Memory) => void; compact?: boolean }) {
  const hero = memory.media.find(m => m.type === 'image')?.url
  return (
    <button className={`memory-card ${compact ? 'memory-card--compact' : ''}`} onClick={() => onOpen(memory)}>
      <div className="memory-card__media" style={hero ? { backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(4,9,14,.86)), url(${hero})` } : undefined}>
        {!hero && <div className="memory-card__placeholder" />}
        <button
          className="memory-card__favorite"
          aria-label={memory.isFavorite ? 'Favorite memory' : 'Not favorited'}
          onClick={(event) => event.stopPropagation()}
          type="button"
        >
          <Heart size={14} fill={memory.isFavorite ? 'currentColor' : 'none'} />
        </button>
        <div className="memory-card__body">
          <span className={`emotion-dot emotion-${memory.emotion.toLowerCase()}`} />
          <h3>{memory.title}</h3>
          <div className="memory-card__meta">
            <span><MapPin size={12} /> {memory.city}</span>
            <span><CalendarDays size={12} /> {new Date(memory.memoryDate).getFullYear()}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
