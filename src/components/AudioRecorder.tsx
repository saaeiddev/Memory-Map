import { Mic, Pause, Play, RotateCcw, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function AudioRecorder({ onAudio }: { onAudio: (url: string) => void }) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<'idle' | 'recording' | 'paused' | 'done'>('idle')
  const [url, setUrl] = useState<string>('')
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (state !== 'recording') return
    const id = window.setInterval(() => setSeconds(v => v + 1), 1000)
    return () => clearInterval(id)
  }, [state])

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          const value = String(reader.result)
          setUrl(value)
          onAudio(value)
          setState('done')
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start(250)
      setSeconds(0)
      setState('recording')
    } catch {
      setError('Microphone permission was denied or is unavailable.')
    }
  }

  const togglePause = () => {
    const recorder = recorderRef.current
    if (!recorder) return
    if (recorder.state === 'recording') { recorder.pause(); setState('paused') }
    else if (recorder.state === 'paused') { recorder.resume(); setState('recording') }
  }

  const stop = () => recorderRef.current?.state !== 'inactive' && recorderRef.current?.stop()
  const reset = () => { setUrl(''); setSeconds(0); setState('idle'); onAudio('') }

  return (
    <div className="audio-recorder">
      <div className={`waveform ${state === 'recording' ? 'is-recording' : ''}`} aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}
      </div>
      <div className="audio-recorder__row">
        {state === 'idle' && <button type="button" className="soft-button" onClick={start}><Mic size={16}/> Record voice</button>}
        {(state === 'recording' || state === 'paused') && <>
          <button type="button" className="soft-button" onClick={togglePause}>{state === 'recording' ? <Pause size={16}/> : <Play size={16}/>} {state === 'recording' ? 'Pause' : 'Resume'}</button>
          <button type="button" className="soft-button danger" onClick={stop}><Square size={15}/> Stop</button>
          <span className="recording-time">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
        </>}
        {state === 'done' && <>
          <audio controls src={url} />
          <button type="button" className="icon-button" onClick={reset} aria-label="Delete recording"><RotateCcw size={16}/></button>
        </>}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
