import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { supabase, supabaseConfigured } from '../services/supabase'

export function AuthOverlay({ onClose, onLocal, onSignedIn }: { onClose:()=>void; onLocal:()=>void; onSignedIn:()=>void }) {
  const [mode,setMode]=useState<'login'|'signup'|'forgot'>('login')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [name,setName]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e:React.FormEvent){
    e.preventDefault();setMessage('')
    if(!supabase){setMessage('Cloud authentication is not configured on this deployment. Use Local Private Mode or add Supabase environment variables.');return}
    setBusy(true)
    try{
      if(mode==='login'){
        const {error}=await supabase.auth.signInWithPassword({email,password})
        if(error)throw error
        onSignedIn()
      }else if(mode==='signup'){
        const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name}}})
        if(error)throw error
        setMessage('Account created. If email confirmation is enabled, check your inbox before signing in.')
      }else{
        const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.href})
        if(error)throw error
        setMessage('Password reset email sent.')
      }
    }catch(err){setMessage(err instanceof Error?err.message:'Authentication failed.')}
    finally{setBusy(false)}
  }

  return <div className="overlay"><div className="auth-modal glass-panel">
    <button className="auth-back" onClick={onClose}><ArrowLeft size={17}/> Back</button>
    <div className="auth-mark"><LockKeyhole size={22}/></div>
    <span className="eyebrow">Private by design</span>
    <h1>{mode==='login'?'Welcome back':mode==='signup'?'Create your world':'Reset password'}</h1>
    <p>{supabaseConfigured?'Your cloud account keeps each user’s memories private with row-level security.':'This live demo is running without cloud credentials. Local Private Mode works fully in this browser.'}</p>
    <form onSubmit={submit} className="auth-form">
      {mode==='signup'&&<label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/></label>}
      <label>Email<div className="input-with-icon"><Mail size={16}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
      {mode!=='forgot'&&<label>Password<input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required/></label>}
      {message&&<div className="notice">{message}</div>}
      <button className="primary-button full" disabled={busy}>{busy?'Working…':mode==='login'?'Log In':mode==='signup'?'Create Account':'Send Reset Link'}</button>
    </form>
    <div className="auth-switches">
      {mode!=='login'&&<button onClick={()=>setMode('login')}>Log in</button>}
      {mode!=='signup'&&<button onClick={()=>setMode('signup')}>Create account</button>}
      {mode!=='forgot'&&<button onClick={()=>setMode('forgot')}>Forgot password?</button>}
    </div>
    <div className="auth-divider"><span>or</span></div>
    <button className="secondary-button full" onClick={onLocal}>Continue in Local Private Mode</button>
    <small className="auth-note">Local mode stores your changes on this device. Configure Supabase for secure multi-device cloud sync.</small>
  </div></div>
}
