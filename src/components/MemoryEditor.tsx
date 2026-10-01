import { Camera, ImagePlus, LocateFixed, MapPin, Save, Video } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { Emotion, Memory, MemoryMedia, Person } from '../types'
import { MAX_MEDIA_BYTES, readFileAsDataUrl } from '../utils/media'
import { AudioRecorder } from './AudioRecorder'

const emotions: Emotion[] = ['Happy','Excited','Peaceful','Romantic','Nostalgic','Grateful','Inspired','Sad','Lonely','Anxious','Proud','Surprised']

function defaultDate() {
  return new Date().toISOString().slice(0, 10)
}

export function MemoryEditor({ initial, onSave, onCancel }: { initial?: Memory; onSave: (m: Memory) => void; onCancel?: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.memoryDate?.slice(0,10) ?? defaultDate())
  const [datePrecision, setDatePrecision] = useState<Memory['datePrecision']>(initial?.datePrecision ?? 'exact')
  const [city, setCity] = useState(initial?.city ?? '')
  const [country, setCountry] = useState(initial?.country ?? '')
  const [latitude, setLatitude] = useState(String(initial?.latitude ?? ''))
  const [longitude, setLongitude] = useState(String(initial?.longitude ?? ''))
  const [emotion, setEmotion] = useState<Emotion>(initial?.emotion ?? 'Happy')
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '')
  const [people, setPeople] = useState(initial?.people.map(p => p.name).join(', ') ?? '')
  const [media, setMedia] = useState<MemoryMedia[]>(initial?.media ?? [])
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const imageMedia = useMemo(() => media.filter(m => m.type === 'image'), [media])

  async function addFiles(files: FileList | null, type: 'image' | 'video') {
    if (!files?.length) return
    setError('')
    const incoming: MemoryMedia[] = []
    for (const file of Array.from(files)) {
      if (file.size > MAX_MEDIA_BYTES) {
        setError(`${file.name} is larger than 20 MB.`)
        continue
      }
      if (type === 'image' && !file.type.startsWith('image/')) continue
      if (type === 'video' && !file.type.startsWith('video/')) continue
      try {
        const url = await readFileAsDataUrl(file)
        incoming.push({ id: crypto.randomUUID(), type, url, name: file.name, mime: file.type })
      } catch {
        setError(`Could not read ${file.name}.`)
      }
    }
    setMedia(current => [...current, ...incoming])
  }

  function useCurrentLocation() {
    setError('')
    if (!navigator.geolocation) { setError('Geolocation is not supported by this browser.'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      p => {
        setLatitude(p.coords.latitude.toFixed(6))
        setLongitude(p.coords.longitude.toFixed(6))
        setLocating(false)
      },
      () => { setError('Location permission was denied. You can enter the place manually.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function save(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!title.trim()) { setError('Please add a memory title.'); return }
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      setError('Add valid latitude and longitude coordinates.')
      return
    }
    const now = new Date().toISOString()
    const memoryDate = datePrecision === 'year' ? `${date.slice(0,4)}-01-01` : date
    const parsedPeople: Person[] = people.split(',').map(v => v.trim()).filter(Boolean).map(name => ({
      id: `person-${name.toLowerCase().replace(/[^a-z0-9]+/gi,'-')}`,
      name,
      relationship: 'Personal'
    }))
    const memory: Memory = {
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      memoryDate,
      datePrecision,
      latitude: lat,
      longitude: lng,
      city: city.trim() || 'Unknown place',
      country: country.trim() || 'Unknown country',
      emotion,
      people: parsedPeople,
      tags: tags.split(',').map(v => v.trim()).filter(Boolean),
      media,
      isFavorite: initial?.isFavorite ?? false,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      demo: false
    }
    onSave(memory)
  }

  return (
    <form className="memory-editor" onSubmit={save}>
      <div className="editor-heading">
        <div><span className="eyebrow">New moment</span><h1>{initial ? 'Edit memory' : 'Add a memory'}</h1></div>
        <p>Save the moment now. Refine the details whenever you want.</p>
      </div>

      {error && <div className="notice notice--error" role="alert">{error}</div>}

      <section className="editor-section">
        <label>Memory title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="A Perfect Evening" maxLength={100} /></label>
        <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What do you want to remember?" rows={5} maxLength={4000} /></label>
      </section>

      <section className="editor-section">
        <div className="section-title"><ImagePlus size={18}/><div><h2>Photos & video</h2><p>Your media stays local in demo mode.</p></div></div>
        <div className="media-actions">
          <button type="button" className="soft-button" onClick={()=>imageInputRef.current?.click()}><ImagePlus size={16}/> Photo library</button>
          <button type="button" className="soft-button" onClick={()=>cameraInputRef.current?.click()}><Camera size={16}/> Camera</button>
          <button type="button" className="soft-button" onClick={()=>videoInputRef.current?.click()}><Video size={16}/> Video</button>
          <input ref={imageInputRef} hidden type="file" accept="image/*" multiple onChange={e=>void addFiles(e.target.files,'image')} />
          <input ref={cameraInputRef} hidden type="file" accept="image/*" capture="environment" onChange={e=>void addFiles(e.target.files,'image')} />
          <input ref={videoInputRef} hidden type="file" accept="video/*" onChange={e=>void addFiles(e.target.files,'video')} />
        </div>
        {media.length > 0 && <div className="media-grid">
          {media.map(item => (
            <div className="media-thumb" key={item.id}>
              {item.type === 'image' ? <img src={item.url} alt="Memory upload"/> : item.type === 'video' ? <video src={item.url} muted /> : <span>Voice memory</span>}
              <button type="button" aria-label="Remove media" onClick={()=>setMedia(current=>current.filter(m=>m.id!==item.id))}>×</button>
            </div>
          ))}
        </div>}
        {!imageMedia.length && <div className="upload-empty">Add a photo to give this memory a cinematic cover.</div>}
      </section>

      <section className="editor-section">
        <div className="section-title"><span className="section-icon">〽</span><div><h2>Voice memory</h2><p>Record the sound of the moment or a note to your future self.</p></div></div>
        <AudioRecorder onAudio={url => {
          setMedia(current => current.filter(m => m.type !== 'audio'))
          if (url) setMedia(current => [...current, { id: crypto.randomUUID(), type:'audio', url, name:'Voice memory' }])
        }} />
      </section>

      <section className="editor-section editor-grid-2">
        <label>Date precision<select value={datePrecision} onChange={e=>setDatePrecision(e.target.value as Memory['datePrecision'])}><option value="exact">Exact date</option><option value="approximate">Approximate date</option><option value="year">Year only</option></select></label>
        <label>{datePrecision === 'year' ? 'Year' : 'Date'}<input type={datePrecision === 'year' ? 'number' : 'date'} min={datePrecision === 'year' ? '1900' : undefined} max={datePrecision === 'year' ? '2100' : undefined} value={datePrecision === 'year' ? date.slice(0,4) : date} onChange={e=>setDate(datePrecision === 'year' ? `${e.target.value}-01-01` : e.target.value)} /></label>
      </section>

      <section className="editor-section">
        <div className="section-title"><MapPin size={18}/><div><h2>Place</h2><p>Use your current location or enter it manually.</p></div></div>
        <button className="soft-button" type="button" onClick={useCurrentLocation} disabled={locating}><LocateFixed size={16}/>{locating ? 'Locating…' : 'Use current location'}</button>
        <div className="editor-grid-2 compact-grid">
          <label>City<input value={city} onChange={e=>setCity(e.target.value)} placeholder="Kyoto" /></label>
          <label>Country<input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Japan" /></label>
          <label>Latitude<input inputMode="decimal" value={latitude} onChange={e=>setLatitude(e.target.value)} placeholder="35.0116" /></label>
          <label>Longitude<input inputMode="decimal" value={longitude} onChange={e=>setLongitude(e.target.value)} placeholder="135.7681" /></label>
        </div>
      </section>

      <section className="editor-section">
        <div className="section-title"><span className="section-icon">✦</span><div><h2>Emotion</h2><p>How did this moment feel?</p></div></div>
        <div className="emotion-picker">
          {emotions.map(item => <button type="button" key={item} className={emotion===item ? 'selected' : ''} onClick={()=>setEmotion(item)}><span className={`emotion-dot emotion-${item.toLowerCase()}`}/>{item}</button>)}
        </div>
      </section>

      <section className="editor-section editor-grid-2">
        <label>People<input value={people} onChange={e=>setPeople(e.target.value)} placeholder="Mom, Alex, Mina"/><small>Separate names with commas.</small></label>
        <label>Tags<input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Travel, Family, Cinema"/><small>Separate tags with commas.</small></label>
      </section>

      <div className="editor-footer">
        {onCancel && <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="primary-button"><Save size={17}/> {initial ? 'Save changes' : 'Save memory'}</button>
      </div>
    </form>
  )
}
