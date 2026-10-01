import { ArrowLeft, CalendarRange, Check, Download, Heart, MapPin, Play, Plus, RotateCcw, Search, ShieldCheck, Sparkles, Trash2, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MemoryCard } from '../components/MemoryCard'
import type { Emotion, Memory, StoryCollection, ViewKey } from '../types'
import type { LocalProfile } from '../store/memoryStore'

export function SubpageHeader({ eyebrow, title, copy, onBack }: { eyebrow: string; title: string; copy?: string; onBack: () => void }) {
  return <div className="subpage-header"><button className="icon-button glass" onClick={onBack}><ArrowLeft size={18}/></button><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{copy&&<p>{copy}</p>}</div></div>
}

export function PeoplePage({ memories, onOpen, onBack }: { memories: Memory[]; onOpen:(m:Memory)=>void; onBack:()=>void }) {
  const people = useMemo(()=>{
    const map=new Map<string,{name:string;relationship:string;memories:Memory[]}>()
    memories.forEach(m=>m.people.forEach(p=>{const e=map.get(p.id)??{name:p.name,relationship:p.relationship,memories:[]};e.memories.push(m);map.set(p.id,e)}))
    return [...map.values()].sort((a,b)=>b.memories.length-a.memories.length)
  },[memories])
  return <section className="page-shell"><SubpageHeader eyebrow="Connections" title="People" copy="The stories you share with the people in your life." onBack={onBack}/><div className="entity-grid">{people.map(p=><article className="entity-card" key={p.name}><div className="entity-avatar"><UsersRound size={22}/></div><div><h2>{p.name}</h2><p>{p.relationship} · {p.memories.length} memories together</p></div><div className="mini-memory-row">{p.memories.slice(0,3).map(m=><MemoryCard key={m.id} memory={m} onOpen={onOpen} compact/>)}</div></article>)}</div>{!people.length&&<Empty title="No people yet" copy="Add names to a memory and they’ll appear here."/>}</section>
}

export function PlacesPage({ memories, onOpen, onBack }: { memories:Memory[];onOpen:(m:Memory)=>void;onBack:()=>void }) {
  const places=useMemo(()=>{const map=new Map<string,Memory[]>();memories.forEach(m=>{const key=`${m.city}, ${m.country}`;map.set(key,[...(map.get(key)??[]),m])});return [...map.entries()].sort((a,b)=>b[1].length-a[1].length)},[memories])
  return <section className="page-shell"><SubpageHeader eyebrow="Geography" title="Places" copy="Every place that holds part of your story." onBack={onBack}/><div className="place-list">{places.map(([place,items])=><article className="place-card glass-panel" key={place}><div className="place-icon"><MapPin size={18}/></div><div className="place-copy"><h2>{place}</h2><p>{items.length} {items.length===1?'memory':'memories'}</p></div><div className="place-thumbs">{items.slice(0,4).map(m=>{const img=m.media.find(x=>x.type==='image')?.url;return <button key={m.id} onClick={()=>onOpen(m)} style={img?{backgroundImage:`url(${img})`}:undefined} aria-label={m.title}/>})}</div></article>)}</div></section>
}

export function EmotionsPage({ memories,onOpen,onBack }:{memories:Memory[];onOpen:(m:Memory)=>void;onBack:()=>void}) {
  const groups=useMemo(()=>{const map=new Map<Emotion,Memory[]>();memories.forEach(m=>map.set(m.emotion,[...(map.get(m.emotion)??[]),m]));return [...map.entries()].sort((a,b)=>b[1].length-a[1].length)},[memories])
  return <section className="page-shell"><SubpageHeader eyebrow="Patterns" title="Emotions" copy="A personal journal view — descriptive, never diagnostic." onBack={onBack}/><div className="emotion-overview">{groups.map(([emotion,items])=><article className="emotion-summary" key={emotion}><span className={`big-emotion emotion-${emotion.toLowerCase()}`}><Sparkles size={18}/></span><div><h2>{emotion}</h2><strong>{items.length}</strong><span> memories</span></div><div className="emotion-bar"><i style={{width:`${Math.max(14,(items.length/Math.max(...groups.map(g=>g[1].length)))*100)}%`}}/></div><div className="mini-memory-row">{items.slice(0,2).map(m=><MemoryCard key={m.id} memory={m} onOpen={onOpen} compact/>)}</div></article>)}</div></section>
}

export function FavoritesPage({memories,onOpen,onBack}:{memories:Memory[];onOpen:(m:Memory)=>void;onBack:()=>void}) {
  const items=memories.filter(m=>m.isFavorite)
  return <section className="page-shell"><SubpageHeader eyebrow="Collection" title="Favorites" copy="The moments you never want to lose sight of." onBack={onBack}/><div className="timeline-grid">{items.map(m=><MemoryCard key={m.id} memory={m} onOpen={onOpen}/>)}</div>{!items.length&&<Empty title="No favorites yet" copy="Tap the heart on a memory to keep it close."/>}</section>
}

export function JourneyPage({memories,onOpen,onBack}:{memories:Memory[];onOpen:(m:Memory)=>void;onBack:()=>void}) {
  const ordered=[...memories].sort((a,b)=>a.memoryDate.localeCompare(b.memoryDate))
  return <section className="page-shell journey-page"><SubpageHeader eyebrow="Life path" title="My Journey" copy="Your memories, ordered in time and connected through place." onBack={onBack}/><div className="journey-line">{ordered.map((m,i)=><button className="journey-stop" key={m.id} onClick={()=>onOpen(m)}><span className="journey-year">{new Date(m.memoryDate).getFullYear()}</span><span className="journey-node"><i/></span><span className="journey-copy"><strong>{m.city}</strong><small>{m.country} · {m.title}</small></span>{i<ordered.length-1&&<span className="journey-connector"/>}</button>)}</div></section>
}

export function StoriesPage({memories,stories,onStoriesChange,onPlay,onBack}:{memories:Memory[];stories:StoryCollection[];onStoriesChange:(v:StoryCollection[])=>void;onPlay:(ids:string[],title:string)=>void;onBack:()=>void}) {
  const [creating,setCreating]=useState(false)
  const [title,setTitle]=useState('My Story')
  const [selected,setSelected]=useState<string[]>([])
  const toggle=(id:string)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  const save=()=>{if(!selected.length)return;const story:{id:string;title:string;memoryIds:string[];createdAt:string}={id:crypto.randomUUID(),title:title.trim()||'My Story',memoryIds:selected,createdAt:new Date().toISOString()};onStoriesChange([...stories,story]);setCreating(false);setSelected([])}
  return <section className="page-shell"><SubpageHeader eyebrow="Cinematic playback" title="Story Mode" copy="Choose memories and play them as a visual life story." onBack={onBack}/>{!creating&&<button className="primary-button" onClick={()=>setCreating(true)}><Plus size={16}/> Create story</button>}{creating&&<div className="story-builder glass-panel"><label>Story title<input value={title} onChange={e=>setTitle(e.target.value)}/></label><div className="story-select-grid">{[...memories].sort((a,b)=>a.memoryDate.localeCompare(b.memoryDate)).map(m=><button className={selected.includes(m.id)?'selected':''} key={m.id} onClick={()=>toggle(m.id)}><span>{selected.includes(m.id)?<Check size={15}/>:<Plus size={15}/>}</span><div><strong>{m.title}</strong><small>{m.city} · {new Date(m.memoryDate).getFullYear()}</small></div></button>)}</div><div className="editor-footer"><button className="secondary-button" onClick={()=>setCreating(false)}>Cancel</button><button className="primary-button" disabled={!selected.length} onClick={save}>Save story</button></div></div>}
  <div className="stories-list">{stories.map(story=><article className="story-card" key={story.id}><span className="story-icon"><Play size={18}/></span><div><h2>{story.title}</h2><p>{story.memoryIds.length} memories</p></div><button className="small-primary" onClick={()=>onPlay(story.memoryIds,story.title)}>Play</button><button className="icon-button" onClick={()=>onStoriesChange(stories.filter(s=>s.id!==story.id))}><Trash2 size={15}/></button></article>)}</div>{!stories.length&&!creating&&<Empty title="No stories yet" copy="Select a few moments and turn them into a cinematic sequence."/>}</section>
}

export function SettingsPage({profile,onProfileChange,reducedMotion,onReducedMotion,onExport,onReset,onBack}:{profile:LocalProfile;onProfileChange:(p:LocalProfile)=>void;reducedMotion:boolean;onReducedMotion:(v:boolean)=>void;onExport:()=>void;onReset:()=>void;onBack:()=>void}) {
  const [name,setName]=useState(profile.name)
  return <section className="page-shell settings-page"><SubpageHeader eyebrow="Control center" title="Settings" copy="Privacy, profile and data controls." onBack={onBack}/><div className="settings-groups">
    <section className="settings-card"><div className="section-title"><UsersRound size={18}/><div><h2>Profile</h2><p>Your local display identity.</p></div></div><label>Display name<input value={name} onChange={e=>setName(e.target.value)} onBlur={()=>onProfileChange({...profile,name:name.trim()||'Memory Explorer'})}/></label></section>
    <section className="settings-card"><div className="section-title"><ShieldCheck size={18}/><div><h2>Privacy</h2><p>Memories are private by default. Demo mode stores data in this browser.</p></div></div><div className="setting-row"><span><strong>Reduced motion</strong><small>Reduce ambient and 3D movement.</small></span><button className={`toggle ${reducedMotion?'on':''}`} onClick={()=>onReducedMotion(!reducedMotion)} aria-pressed={reducedMotion}><i/></button></div></section>
    <section className="settings-card"><div className="section-title"><Download size={18}/><div><h2>Your data</h2><p>Take your memories with you.</p></div></div><button className="soft-button" onClick={onExport}><Download size={16}/> Export JSON</button><button className="soft-button danger" onClick={onReset}><RotateCcw size={16}/> Reset local demo data</button></section>
  </div></section>
}

export function SearchOverlay({memories,onClose,onOpen}:{memories:Memory[];onClose:()=>void;onOpen:(m:Memory)=>void}) {
  const [q,setQ]=useState('')
  const results=useMemo(()=>{const query=q.trim().toLowerCase();if(!query)return memories.slice(0,6);return memories.filter(m=>[m.title,m.description,m.city,m.country,m.emotion,m.tags.join(' '),m.people.map(p=>p.name).join(' '),m.memoryDate].join(' ').toLowerCase().includes(query)).slice(0,12)},[memories,q])
  return <div className="overlay" onMouseDown={onClose}><div className="search-modal" onMouseDown={e=>e.stopPropagation()}><div className="search-box"><Search size={19}/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search places, people, moods, dates…"/><button onClick={onClose}>Esc</button></div><div className="search-results">{results.map(m=><button key={m.id} onClick={()=>{onOpen(m);onClose()}}><span className={`emotion-dot emotion-${m.emotion.toLowerCase()}`}/><div><strong>{m.title}</strong><small>{m.city}, {m.country} · {new Date(m.memoryDate).getFullYear()}</small></div></button>)}</div>{!results.length&&<Empty title="No matching memories" copy="Try a place, person, tag, mood or year."/>}</div></div>
}

export function StoryPlayer({memories,title,onClose}:{memories:Memory[];title:string;onClose:()=>void}) {
  const [index,setIndex]=useState(0)
  const current=memories[index]
  if(!current)return null
  const hero=current.media.find(m=>m.type==='image')?.url
  return <div className="story-player" style={hero?{backgroundImage:`linear-gradient(180deg,rgba(5,8,12,.18),rgba(5,8,12,.86)),url(${hero})`}:undefined}><div className="story-progress">{memories.map((_,i)=><i key={i} className={i<=index?'active':''}/>)}</div><button className="story-close" onClick={onClose}>×</button><span className="story-title">{title}</span><div className="story-player__copy"><span>{current.city}, {current.country} · {new Date(current.memoryDate).getFullYear()}</span><h1>{current.title}</h1><p>{current.description}</p></div><div className="story-controls"><button disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}>Previous</button><span>{index+1} / {memories.length}</span><button disabled={index===memories.length-1} onClick={()=>setIndex(i=>Math.min(memories.length-1,i+1))}>Next</button></div></div>
}

function Empty({title,copy}:{title:string;copy:string}){return <div className="empty-state"><div className="empty-orb"/><h2>{title}</h2><p>{copy}</p></div>}
