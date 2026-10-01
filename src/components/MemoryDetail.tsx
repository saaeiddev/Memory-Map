import { ArrowLeft, Box, CalendarDays, Download, Edit3, Heart, MapPin, Share2, Trash2, Users } from 'lucide-react'
import type { Memory } from '../types'

function svgEscape(value: string) {
  return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c] ?? c))
}

function downloadShareCard(memory: Memory) {
  const subtitle = `${memory.city}, ${memory.country} • ${new Date(memory.memoryDate).getFullYear()}`
  const quote = memory.description.slice(0, 150)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071019"/><stop offset=".55" stop-color="#0c1b29"/><stop offset="1" stop-color="#17152a"/></linearGradient><radialGradient id="glow"><stop stop-color="#f6c76c" stop-opacity=".35"/><stop offset="1" stop-color="#f6c76c" stop-opacity="0"/></radialGradient></defs>
  <rect width="1080" height="1350" rx="62" fill="url(#bg)"/><circle cx="850" cy="250" r="420" fill="url(#glow)"/><path d="M146 142c-44 0-80 36-80 80 0 68 80 148 80 148s80-80 80-148c0-44-36-80-80-80zm0 112a32 32 0 1 1 0-64 32 32 0 0 1 0 64z" fill="#f7c86c"/>
  <text x="80" y="470" fill="#f2f4f7" font-size="74" font-family="Arial, sans-serif" font-weight="700">${svgEscape(memory.title.slice(0, 28))}</text>
  <text x="80" y="545" fill="#f6c76c" font-size="30" font-family="Arial, sans-serif">${svgEscape(subtitle)}</text>
  <foreignObject x="80" y="620" width="900" height="390"><div xmlns="http://www.w3.org/1999/xhtml" style="font: 38px/1.5 Arial,sans-serif;color:#d9e1e8;">${svgEscape(quote)}</div></foreignObject>
  <text x="80" y="1210" fill="#8295a8" font-size="28" font-family="Arial, sans-serif">MEMORY MAP · YOUR LIFE, IN PLACES.</text></svg>`
  const blob = new Blob([svg], {type:'image/svg+xml'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${memory.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-memory-map.svg`
  a.click()
  URL.revokeObjectURL(url)
}

export function MemoryDetail({ memory, onBack, onEdit, onDelete, onFavorite, onRoom }: {
  memory: Memory
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onFavorite: () => void
  onRoom: () => void
}) {
  const hero = memory.media.find(m=>m.type==='image')?.url
  const images = memory.media.filter(m=>m.type==='image')
  const video = memory.media.find(m=>m.type==='video')
  const audio = memory.media.find(m=>m.type==='audio')

  async function share() {
    const text = `${memory.title} — ${memory.city}, ${memory.country}`
    if (navigator.share) {
      try { await navigator.share({ title: memory.title, text }) } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard?.writeText(text)
      alert('Memory text copied to clipboard.')
    }
  }

  return (
    <article className="memory-detail">
      <div className="memory-hero" style={hero ? {backgroundImage:`linear-gradient(180deg, rgba(4,8,13,.15), rgba(4,8,13,.9)), url(${hero})`} : undefined}>
        <button className="floating-back" onClick={onBack} aria-label="Back"><ArrowLeft size={19}/></button>
        <div className="hero-actions">
          <button className="icon-button glass" onClick={onFavorite} aria-label="Favorite"><Heart size={18} fill={memory.isFavorite ? 'currentColor' : 'none'}/></button>
          <button className="icon-button glass" onClick={share} aria-label="Share"><Share2 size={18}/></button>
        </div>
        <div className="memory-hero__content">
          <span className="memory-kicker"><span className={`emotion-dot emotion-${memory.emotion.toLowerCase()}`}/>{memory.emotion}</span>
          <h1>{memory.title}</h1>
          <div className="memory-hero__meta"><span><CalendarDays size={15}/>{new Date(memory.memoryDate).toLocaleDateString(undefined,{year:'numeric',month:'long',day:memory.datePrecision==='year'?undefined:'numeric'})}</span><span><MapPin size={15}/>{memory.city}, {memory.country}</span></div>
        </div>
      </div>

      <div className="memory-detail__content">
        <p className="memory-description">{memory.description || 'No written note for this memory yet.'}</p>
        {memory.people.length > 0 && <div className="detail-row"><Users size={17}/><div><strong>People</strong><p>{memory.people.map(p=>p.name).join(', ')}</p></div></div>}
        {memory.tags.length > 0 && <div className="tag-row">{memory.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>}

        {images.length > 1 && <section><h2>Photos</h2><div className="detail-gallery">{images.map(image=><img key={image.id} src={image.url} alt="Memory" loading="lazy"/>)}</div></section>}
        {video && <section><h2>Video</h2><video className="detail-video" src={video.url} controls playsInline /></section>}
        {audio && <section><h2>Voice memory</h2><audio className="detail-audio" src={audio.url} controls /></section>}

        <div className="detail-actions">
          <button className="primary-button" onClick={onRoom}><Box size={17}/> Enter Memory Room</button>
          <button className="secondary-button" onClick={onEdit}><Edit3 size={17}/> Edit</button>
          <button className="secondary-button" onClick={()=>downloadShareCard(memory)}><Download size={17}/> Share card</button>
          <button className="secondary-button danger" onClick={onDelete}><Trash2 size={17}/> Delete</button>
        </div>
      </div>
    </article>
  )
}
