import { CircleUserRound, Clock3, Cuboid, Map, Plus } from 'lucide-react'
import type { ViewKey } from '../types'

const items: Array<{ key: ViewKey; label: string; icon: typeof Map }> = [
  { key: 'map', label: 'Map', icon: Map },
  { key: 'timeline', label: 'Timeline', icon: Clock3 },
  { key: 'add', label: 'Add', icon: Plus },
  { key: 'rooms', label: 'Rooms', icon: Cuboid },
  { key: 'profile', label: 'Profile', icon: CircleUserRound }
]

export function AppNav({ active, onChange }: { active: ViewKey; onChange: (v: ViewKey) => void }) {
  return (
    <nav className="app-nav" aria-label="Primary navigation">
      {items.map(({ key, label, icon: Icon }) => (
        <button key={key} className={active === key ? 'active' : ''} onClick={() => onChange(key)} aria-current={active === key ? 'page' : undefined}>
          <Icon size={key === 'add' ? 22 : 19} strokeWidth={key === 'add' ? 2.4 : 1.9} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
