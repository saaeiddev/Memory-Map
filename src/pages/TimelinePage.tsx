import { Filter } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MemoryCard } from '../components/MemoryCard'
import type { Memory } from '../types'

type FilterKey = 'All'|'Photos'|'Videos'|'Audio'|'Places'|'People'|'Favorites'

export function TimelinePage({ memories, onOpen }: { memories: Memory[]; onOpen: (m: Memory) => void }) {
  const [filter, setFilter] = useState<FilterKey>('All')
  const filtered = useMemo(() => memories.filter(m => {
    if (filter==='All' || filter==='Places') return true
    if (filter==='Photos') return m.media.some(x=>x.type==='image')
    if (filter==='Videos') return m.media.some(x=>x.type==='video')
    if (filter==='Audio') return m.media.some(x=>x.type==='audio')
    if (filter==='People') return m.people.length>0
    if (filter==='Favorites') return m.isFavorite
    return true
  }).sort((a,b)=>b.memoryDate.localeCompare(a.memoryDate)), [memories,filter])
  const groups = useMemo(() => {
    const map = new Map<number, Memory[]>()
    filtered.forEach(m=>{ const y=new Date(m.memoryDate).getFullYear(); map.set(y,[...(map.get(y)??[]),m]) })
    return [...map.entries()].sort((a,b)=>b[0]-a[0])
  },[filtered])

  return (
    <section className="page-shell timeline-page">
      <div className="page-heading"><div><span className="eyebrow">Chronology</span><h1>Your timeline</h1><p>Every moment, in the order life gave it to you.</p></div><span className="heading-count">{filtered.length} memories</span></div>
      <div className="filter-strip" aria-label="Timeline filters"><Filter size={15}/>{(['All','Photos','Videos','Audio','Places','People','Favorites'] as FilterKey[]).map(item=><button className={filter===item?'selected':''} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div>
      <div className="timeline-years">
        {groups.map(([year,items]) => <section className="year-group" key={year}><div className="year-label"><strong>{year}</strong><span>{items.length} moments</span></div><div className="timeline-grid">{items.map(m=><MemoryCard key={m.id} memory={m} onOpen={onOpen}/>)}</div></section>)}
        {!groups.length && <div className="empty-state"><div className="empty-orb"/><h2>No memories here yet</h2><p>Try a different filter or add a new moment.</p></div>}
      </div>
    </section>
  )
}
