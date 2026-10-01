import { useEffect, useMemo, useState } from 'react'
import { Cloud, WifiOff } from 'lucide-react'
import { AppNav } from './components/AppNav'
import { AuthOverlay } from './components/AuthOverlay'
import { Brand } from './components/Brand'
import { MemoryDetail } from './components/MemoryDetail'
import { MemoryEditor } from './components/MemoryEditor'
import { MemoryRoom } from './components/MemoryRoom'
import { demoMemories } from './data/demo'
import { deleteCloudMemory, fetchCloudMemories, saveCloudMemory } from './services/cloudStore'
import { supabase, supabaseConfigured } from './services/supabase'
import { loadMemories, loadProfile, loadStories, resetLocalDemo, saveMemories, saveProfile, saveStories, type LocalProfile } from './store/memoryStore'
import type { Memory, StoryCollection, ViewKey } from './types'
import { downloadJson } from './utils/media'
import { LandingPage } from './pages/LandingPage'
import { MapPage } from './pages/MapPage'
import { TimelinePage } from './pages/TimelinePage'
import { RoomsPage } from './pages/RoomsPage'
import { ProfilePage } from './pages/ProfilePage'
import { EmotionsPage, FavoritesPage, JourneyPage, PeoplePage, PlacesPage, SearchOverlay, SettingsPage, StoriesPage, StoryPlayer } from './pages/ExplorePages'

type DataMode = 'local' | 'cloud' | 'demo'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [dataMode, setDataMode] = useState<DataMode>('demo')
  const [cloudUserId, setCloudUserId] = useState<string | null>(null)
  const [memories, setMemories] = useState<Memory[]>(() => loadMemories())
  const [stories, setStories] = useState<StoryCollection[]>(() => loadStories())
  const [profile, setProfile] = useState<LocalProfile>(() => loadProfile())
  const [view, setView] = useState<ViewKey>('map')
  const [selected, setSelected] = useState<Memory | null>(null)
  const [editing, setEditing] = useState<Memory | null | 'new'>(null)
  const [room, setRoom] = useState<Memory | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('memory-map:reduced-motion') === '1' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  const [storyPlayback, setStoryPlayback] = useState<{title:string;memories:Memory[]}|null>(null)
  const [loadingCloud, setLoadingCloud] = useState(false)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (dataMode === 'local') saveMemories(memories)
  }, [memories, dataMode])
  useEffect(() => { saveStories(stories) }, [stories])
  useEffect(() => { saveProfile(profile) }, [profile])
  useEffect(() => { localStorage.setItem('memory-map:reduced-motion', reducedMotion ? '1' : '0') }, [reducedMotion])
  useEffect(() => { if(!toast)return; const t=setTimeout(()=>setToast(''),3200); return()=>clearTimeout(t) }, [toast])

  const showNav = entered && !selected && !editing && !room && !storyPlayback

  async function enterCloud() {
    if (!supabase) return
    setLoadingCloud(true)
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) { setLoadingCloud(false); return }
    setCloudUserId(user.id)
    const display = user.user_metadata?.display_name as string | undefined
    if (display) setProfile(p => ({...p,name:display}))
    try {
      const cloud = await fetchCloudMemories(user.id)
      setMemories(cloud)
      setDataMode('cloud')
      setEntered(true)
      setAuthOpen(false)
      setToast(cloud.length ? 'Cloud memories loaded.' : 'Your private cloud account is ready.')
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Could not load cloud memories.')
    } finally { setLoadingCloud(false) }
  }

  function enterDemo() {
    setMemories(demoMemories)
    setDataMode('demo')
    setEntered(true)
    setView('map')
  }

  function enterLocal() {
    setMemories(loadMemories(false))
    setDataMode('local')
    setEntered(true)
    setAuthOpen(false)
    setView('map')
    setToast('Local Private Mode enabled on this device.')
  }

  async function persistMemory(memory: Memory) {
    try {
      if (dataMode === 'cloud' && cloudUserId) {
        setToast('Saving securely…')
        const saved = await saveCloudMemory(cloudUserId, memory)
        setMemories(current => current.some(m=>m.id===saved.id) ? current.map(m=>m.id===saved.id?saved:m) : [saved,...current])
      } else {
        setMemories(current => current.some(m=>m.id===memory.id) ? current.map(m=>m.id===memory.id?memory:m) : [memory,...current])
      }
      setEditing(null)
      setSelected(memory)
      setToast('Memory saved.')
    } catch (error) { setToast(error instanceof Error ? error.message : 'Could not save memory.') }
  }

  async function removeMemory(memory: Memory) {
    if (!confirm(`Delete “${memory.title}”? This cannot be undone.`)) return
    try {
      if (dataMode==='cloud'&&cloudUserId) await deleteCloudMemory(cloudUserId,memory)
      setMemories(current=>current.filter(m=>m.id!==memory.id))
      setSelected(null); setRoom(null); setToast('Memory deleted.')
    } catch(error){ setToast(error instanceof Error?error.message:'Delete failed.') }
  }

  async function toggleFavorite(memory: Memory) {
    const updated={...memory,isFavorite:!memory.isFavorite,updatedAt:new Date().toISOString()}
    if(dataMode==='cloud'&&cloudUserId){try{const saved=await saveCloudMemory(cloudUserId,updated);setMemories(c=>c.map(m=>m.id===saved.id?saved:m));setSelected(saved)}catch(e){setToast(e instanceof Error?e.message:'Could not update favorite.')}}
    else {setMemories(c=>c.map(m=>m.id===updated.id?updated:m));setSelected(updated)}
  }

  function exportData(){downloadJson(`memory-map-export-${new Date().toISOString().slice(0,10)}.json`,{exportedAt:new Date().toISOString(),memories,stories,profile});setToast('Export downloaded.')}

  function resetLocal(){
    if(!confirm('Reset local demo data? Cloud data will not be affected.'))return
    resetLocalDemo(); setMemories([]); setStories([]); setDataMode('local'); setToast('Local data reset.')
  }

  function navigate(next: ViewKey){setView(next); if(next==='add')setEditing('new')}

  function page() {
    if (view === 'map') return <MapPage memories={memories} onOpen={setSelected} onSearch={()=>setSearchOpen(true)} reducedMotion={reducedMotion}/>
    if (view === 'timeline') return <TimelinePage memories={memories} onOpen={setSelected}/>
    if (view === 'rooms') return <RoomsPage memories={memories} onEnter={setRoom}/>
    if (view === 'profile') return <ProfilePage memories={memories} profile={profile} onNavigate={navigate} onExport={exportData}/>
    if (view === 'people') return <PeoplePage memories={memories} onOpen={setSelected} onBack={()=>setView('profile')}/>
    if (view === 'places') return <PlacesPage memories={memories} onOpen={setSelected} onBack={()=>setView('profile')}/>
    if (view === 'emotions') return <EmotionsPage memories={memories} onOpen={setSelected} onBack={()=>setView('profile')}/>
    if (view === 'favorites') return <FavoritesPage memories={memories} onOpen={setSelected} onBack={()=>setView('profile')}/>
    if (view === 'journey') return <JourneyPage memories={memories} onOpen={setSelected} onBack={()=>setView('profile')}/>
    if (view === 'stories') return <StoriesPage memories={memories} stories={stories} onStoriesChange={setStories} onPlay={(ids,title)=>setStoryPlayback({title,memories:ids.map(id=>memories.find(m=>m.id===id)).filter(Boolean) as Memory[]})} onBack={()=>setView('profile')}/>
    if (view === 'settings') return <SettingsPage profile={profile} onProfileChange={setProfile} reducedMotion={reducedMotion} onReducedMotion={setReducedMotion} onExport={exportData} onReset={resetLocal} onBack={()=>setView('profile')}/>
    return <MapPage memories={memories} onOpen={setSelected} onSearch={()=>setSearchOpen(true)} reducedMotion={reducedMotion}/>
  }

  if (!entered) return <><LandingPage onStart={()=>setAuthOpen(true)} onDemo={enterDemo}/>{authOpen&&<AuthOverlay onClose={()=>setAuthOpen(false)} onLocal={enterLocal} onSignedIn={()=>void enterCloud()}/>} {loadingCloud&&<div className="global-loading">Opening your memory world…</div>}</>
  if (storyPlayback) return <StoryPlayer memories={storyPlayback.memories} title={storyPlayback.title} onClose={()=>setStoryPlayback(null)}/>
  if (room) return <MemoryRoom memory={room} onBack={()=>setRoom(null)}/>
  if (editing) return <div className="app-frame editor-frame"><header className="app-header"><Brand/><ModeBadge mode={dataMode}/></header><MemoryEditor initial={editing==='new'?undefined:editing} onSave={m=>void persistMemory(m)} onCancel={()=>setEditing(null)}/></div>
  if (selected) return <div className="app-frame detail-frame"><MemoryDetail memory={selected} onBack={()=>setSelected(null)} onEdit={()=>setEditing(selected)} onDelete={()=>void removeMemory(selected)} onFavorite={()=>void toggleFavorite(selected)} onRoom={()=>setRoom(selected)}/></div>

  return <div className="app-frame">
    <header className="app-header"><Brand/><ModeBadge mode={dataMode}/></header>
    <main className="app-content">{page()}</main>
    {showNav&&<AppNav active={view} onChange={navigate}/>} 
    {searchOpen&&<SearchOverlay memories={memories} onClose={()=>setSearchOpen(false)} onOpen={setSelected}/>} 
    {toast&&<div className="toast" role="status">{toast}</div>}
  </div>
}

function ModeBadge({mode}:{mode:DataMode}){
  const cloud=mode==='cloud'
  const label=cloud?'Cloud private':mode==='demo'?'Demo world':'Local private'
  return <span className={`mode-badge mode-${mode}`}>{cloud?<Cloud size={13}/>:<WifiOff size={13}/>} {label}</span>
}
