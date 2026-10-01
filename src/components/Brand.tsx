import { MapPin } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Memory Map">
      <span className="brand-mark"><MapPin size={compact ? 18 : 22} strokeWidth={2.2} /></span>
      {!compact && <span className="brand-name">Memory Map</span>}
    </div>
  )
}
