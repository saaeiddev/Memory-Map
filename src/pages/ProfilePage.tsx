import { CalendarRange, ChevronRight, Download, Heart, MapPinned, Settings, Sparkles, UsersRound, WandSparkles } from 'lucide-react'
import type { Memory, ViewKey } from '../types'
import type { LocalProfile } from '../store/memoryStore'

export function ProfilePage({ memories, profile, onNavigate, onExport }: { memories: Memory[]; profile: LocalProfile; onNavigate: (v: ViewKey) => void; onExport: () => void }) {
  const places = new Set(memories.map(m=>`${m.city}|${m.country}`)).size
  const people = new Set(memories.flatMap(m=>m.people.map(p=>p.id))).size
  const emotions = new Set(memories.map(m=>m.emotion)).size
  const years = new Set(memories.map(m=>new Date(m.memoryDate).getFullYear())).size
  const favorites = memories.filter(m=>m.isFavorite).length
  const photos = memories.flatMap(m=>m.media).filter(m=>m.type==='image').length
  const videos = memories.flatMap(m=>m.media).filter(m=>m.type==='video').length
  const audio = memories.flatMap(m=>m.media).filter(m=>m.type==='audio').length

  const links: Array<[ViewKey,string,string,typeof UsersRound]> = [
    ['people','People',`${people} people`,UsersRound],
    ['places','Places',`${places} places`,MapPinned],
    ['emotions','Emotions',`${emotions} moods`,Sparkles],
    ['favorites','Favorites',`${favorites} saved`,Heart],
    ['journey','My Journey',`${years} years`,CalendarRange],
    ['stories','Story Mode','Build a life story',WandSparkles],
    ['settings','Settings','Privacy & preferences',Settings]
  ]

  return (
    <section className="page-shell profile-page">
      <div className="profile-hero glass-panel">
        <div className="profile-avatar">{profile.avatar ? <img src={profile.avatar} alt="Profile"/> : profile.name.slice(0,1).toUpperCase()}</div>
        <div><span className="eyebrow">Your private world</span><h1>{profile.name}</h1><p>Exploring since {new Date(profile.joinedAt).getFullYear()}</p></div>
      </div>
      <div className="stats-grid">
        {[['Memories',memories.length],['Places',places],['People',people],['Emotions',emotions],['Years',years]].map(([label,value])=><div className="stat-card" key={String(label)}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      <div className="media-stats glass-panel"><div><strong>{photos}</strong><span>Photos</span></div><div><strong>{videos}</strong><span>Videos</span></div><div><strong>{audio}</strong><span>Voice memories</span></div></div>
      <div className="profile-links">
        {links.map(([key,label,meta,Icon])=><button key={key} onClick={()=>onNavigate(key)}><span className="profile-link-icon"><Icon size={18}/></span><span><strong>{label}</strong><small>{meta}</small></span><ChevronRight size={17}/></button>)}
        <button onClick={onExport}><span className="profile-link-icon"><Download size={18}/></span><span><strong>Export memories</strong><small>Download structured JSON</small></span><ChevronRight size={17}/></button>
      </div>
    </section>
  )
}
