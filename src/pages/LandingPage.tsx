import { Box, Clock3, LockKeyhole, Map, MapPin, Smartphone, UsersRound } from 'lucide-react'
import { Brand } from '../components/Brand'

export function LandingPage({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Brand />
        <div className="landing-nav__actions"><button className="text-button" onClick={onDemo}>Explore demo</button><button className="small-primary" onClick={onStart}>Start your journey</button></div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="hero-pill"><span/> Private personal memory world</span>
          <h1>Your life,<br/><em>in places.</em></h1>
          <p>Turn photos, places, voices and emotions into an interactive map of the moments that made you.</p>
          <div className="hero-cta"><button className="primary-button large" onClick={onStart}>Start Your Journey</button><button className="secondary-button large" onClick={onDemo}>Explore Demo</button></div>
          <div className="hero-trust"><LockKeyhole size={15}/><span>Private by default. Your memories belong to you.</span></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
          <div className="hero-globe">
            <div className="hero-globe-grid"/>
            <span className="hero-pin pin-1"><i/></span><span className="hero-pin pin-2"><i/></span><span className="hero-pin pin-3"><i/></span>
          </div>
          <div className="floating-memory card-a"><div className="floating-memory__img img-a"/><span>Kyoto · 2025</span><strong>Cherry Blossoms</strong></div>
          <div className="floating-memory card-b"><div className="floating-memory__img img-b"/><span>Positano · 2026</span><strong>A Perfect Evening</strong></div>
        </div>
      </section>

      <section className="feature-grid">
        {[
          [Map,'3D Memory Map','Explore moments geographically on a cinematic interactive globe.'],
          [Box,'Memory Rooms','Turn an important moment into a small immersive digital museum.'],
          [Clock3,'Life Timeline','Move through years, months and days without losing the story.'],
          [UsersRound,'People','See the memories you share with the people who matter.'],
          [MapPin,'My Journey','Watch your life move across cities and countries over time.'],
          [Smartphone,'Install Anywhere','A mobile-first PWA designed for iPhone, Android and desktop.']
        ].map(([Icon,title,copy]) => {
          const FeatureIcon = Icon as typeof Map
          return <article className="feature-card" key={String(title)}><span className="feature-icon"><FeatureIcon size={20}/></span><h2>{title as string}</h2><p>{copy as string}</p></article>
        })}
      </section>

      <section className="landing-quote"><p>“Not just where I’ve been, but who I’ve become.”</p><span>MEMORY MAP</span></section>
    </main>
  )
}
