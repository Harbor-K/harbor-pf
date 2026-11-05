import React, { useEffect, useRef, useState } from 'react'
import { CSS, IMG, IMG3 } from './portfolio'
import { useScreenInit } from './useScreenInit.js'

// Harbor — portfolio main page v4, from Figma "44기 김지현 4차 PF" (node 260:282) and Harbor's review notes:
// hero (unchanged) → six designer skills strip → three projects, one per block, laid out like rox.com's
// "Applied AI research" section on white → CTA → footer, with an aurora voice assistant in the corner.

export const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}

// Designer skills — edit the labels here.
const SKILLS = ['Empathize', 'Research', 'Define', 'Ideate', 'Prototype', 'Test']

// Only one quote is written so far; add up to five here and the hero rotates through them.
const QUOTES = ['“I started in Fine Art, drawing what I saw.”']
const QUOTE_MS = 5000

export const TB = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/'

type Project = {
  title: string; sub: string; href?: string
  rows: [string, string][]
  note: [string, string]
  video?: string; poster?: string; img?: string; alt?: string; ratio?: string
}
const PROJECTS: Project[] = [
  {
    title: 'Trust Bank Singapore', sub: 'Turning hidden rewards into everyday loyalty.', href: '#/trust-bank',
    rows: [['UX research & redesign', 'Digital banking · Mobile app'], ['I led', 'Planning, UI design, usability test']],
    note: ['85 ease-of-use score', 'SUS · A+ grade'],
    img: IMG3 + 'trust-bank-thumb.webp', alt: 'Trust Bank rewards screen in front of the trust wordmark', ratio: '2 / 1',
  },
  {
    title: 'GameCove', sub: 'An AI game-analytics dashboard.', href: '#/gamecove',
    rows: [['Case study', 'Data dashboard'], ['Team project', 'AI game analytics']],
    note: ['Dashboard designed', 'GameCove'],
    img: IMG + 'gamecove.webp', alt: 'GameCove overview dashboard',
  },
  {
    title: 'UTrada', sub: 'Product design for a trading platform.',
    rows: [['Product design', 'Fintech · Trading'], ['2024 – 2026', 'UTrada']],
    note: ['Shipped', 'Trading platform'],
    img: IMG3 + 'utrada-screens.webp', alt: 'UTrada website screens: home, features, forex table and join flow',
  },
]

export const BARS = 140
const SECTION_IDS: Record<string, string> = { skills: 'skills', work: 'projects', contact: 'contact' }

export const PAGE_CSS = `
.hb .cell { flex-direction: column; gap: 6px; }
.hb .foot { padding-bottom: 40px; }

.projects-sec { background: #fff; }
.proj + .proj { margin-top: 160px; }
.proj-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; margin-bottom: 40px; }
.proj-head h3 { margin: 0; font-size: 44px; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; }
.proj-head h3 .sub { display: block; color: #8C8C8A; font-weight: 300; }
.proj-frame { border: 1px solid var(--line); }
.proj-info { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); border-bottom: 1px solid var(--line); }
.proj-rows { list-style: none; margin: 0; padding: 0; border-right: 1px solid var(--line); }
.proj-rows li { padding: 22px 28px; border-bottom: 1px solid var(--line); }
.proj-rows li:last-child { border-bottom: 0; }
.r-t { font-size: 18px; font-weight: 500; }
.r-s { margin-top: 4px; font-size: 16px; color: var(--mute); }
.proj-side { display: flex; align-items: center; justify-content: center; padding: 28px; background: var(--off); }
.proj-note { display: flex; align-items: center; gap: 14px; width: 100%; max-width: 320px; padding: 16px 20px; background: #fff; border: 1px solid var(--line); box-shadow: 0 10px 30px rgba(0,0,0,.08);
  transform: translateY(16px); opacity: 0; transition: transform .8s var(--ease) .35s, opacity .6s .35s; }
.proj.in .proj-note { transform: none; opacity: 1; }
.proj-note .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink); flex: none; }
.proj-note .t { font-size: 16px; font-weight: 500; }
.proj-note .s { font-size: 16px; color: var(--mute); }
.proj-media { display: block; padding: 0; overflow: hidden; }
.proj-media .shot { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: #E9E9E6; }
.proj-media video, .proj-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.2s var(--ease); }
.proj-media:hover video, .proj-media:hover img { transform: scale(1.03); }
.proj-media .view { position: absolute; left: 20px; bottom: 20px; padding: 10px 16px; background: #fff; color: var(--ink); font-size: 16px; font-weight: 500;
  opacity: 0; transform: translateY(8px); transition: opacity .3s, transform .3s var(--ease); }
.proj-media:hover .view { opacity: 1; transform: none; }

/* Aurora voice assistant — ChatGPT-voice-style orb */
@property --rot { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.orb { position: relative; border-radius: 50%; overflow: hidden; isolation: isolate;
  background: radial-gradient(circle at 50% 120%, #1D4ED8 0%, #3B82F6 35%, #93C5FD 65%, #E0F2FE 100%); }
.orb::before, .orb::after { content: ""; position: absolute; inset: -25%; border-radius: 50%; filter: blur(14px); }
.orb::before { background: conic-gradient(from var(--rot), #E0F2FE, #60A5FA, #FFFFFF, #38BDF8, #BFDBFE, #2563EB, #E0F2FE); opacity: .85; animation: orb-spin 7s linear infinite; mix-blend-mode: soft-light; }
.orb::after { background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.95), rgba(255,255,255,0) 45%), radial-gradient(circle at 70% 75%, rgba(147,197,253,.9), rgba(147,197,253,0) 50%);
  animation: orb-drift 5s ease-in-out infinite alternate; }
@keyframes orb-spin { to { --rot: 360deg; } }
@keyframes orb-drift { 0% { transform: translate(-6%, -4%) scale(1); } 100% { transform: translate(6%, 5%) scale(1.12); } }
.orb.live { animation: orb-pulse 1.1s ease-in-out infinite; }
.orb.talk { animation: orb-talk .5s ease-in-out infinite alternate; }
@keyframes orb-pulse { 50% { transform: scale(1.06); } }
@keyframes orb-talk { 0% { transform: scale(.97); } 100% { transform: scale(1.08); } }

.voice-fab { position: fixed; right: 24px; bottom: 24px; z-index: 60; width: 64px; height: 64px; padding: 0; border: 3px solid #fff; border-radius: 50%; cursor: pointer; background: none;
  box-shadow: 0 10px 30px rgba(37,99,235,.45), 0 0 0 1px rgba(0,0,0,.06); transform: scale(0); transition: transform .5s var(--ease); }
.voice-fab.show { transform: scale(1); }
.voice-fab:hover { transform: scale(1.08); }
.voice-fab .orb { display: block; width: 100%; height: 100%; }
.voice-pop { position: fixed; right: 24px; bottom: 104px; z-index: 60; width: 360px; padding: 28px 24px 24px; background: #fff; color: var(--ink); border: 1px solid var(--line);
  border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,.18); transform-origin: bottom right; text-align: center;
  transform: translateY(12px) scale(.96); opacity: 0; pointer-events: none; transition: transform .35s var(--ease), opacity .25s; }
.voice-pop.open { transform: none; opacity: 1; pointer-events: auto; }
.voice-pop .big { width: 150px; height: 150px; margin: 0 auto; }
.voice-status { margin-top: 18px; font-size: 16px; color: var(--mute); }
.voice-q { margin-top: 10px; font-size: 16px; font-weight: 500; min-height: 22px; }
.voice-a { margin-top: 8px; font-size: 16px; line-height: 1.5; color: #333; min-height: 48px; }
.voice-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px; }
.voice-chips button { padding: 8px 14px; border: 1px solid var(--line); border-radius: 999px; background: #fff; font-size: 16px; cursor: pointer; color: var(--ink); }
.voice-chips button:hover { background: var(--off); }
.voice-ctrl { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.voice-ctrl button { width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer; display: grid; place-items: center; }
.voice-ctrl .mic { background: var(--ink); color: #fff; }
.voice-ctrl .mic.on { background: #2563EB; }
.voice-ctrl .end { background: var(--off); color: var(--ink); }
.voice-ctrl svg { width: 22px; height: 22px; display: block; }

@media (max-width: 900px) {
  .proj-info { grid-template-columns: 1fr; }
  .proj-rows { border-right: 0; border-bottom: 1px solid var(--line); }
  .proj-head { flex-direction: column; align-items: flex-start; }
  .proj-head h3 { font-size: 32px; }
  .voice-pop { left: 16px; right: 16px; width: auto; }
}
`

function useTyped(text: string, key: string | number, speed = 32, delay = 0) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(text.length); return }
    let i = 0, t: number
    const start = window.setTimeout(() => {
      t = window.setInterval(() => { i++; setN(i); if (i >= text.length) clearInterval(t) }, speed)
    }, delay)
    return () => { clearTimeout(start); clearInterval(t) }
  }, [text, key])
  return text.slice(0, n)
}

// Voice assistant: scripted answers about Harbor (no AI backend). Uses the browser's speech
// recognition where available (Chrome/Edge/Safari) and speaks replies with speech synthesis.
const CHIPS = ['Who is Harbor?', 'Show me projects', 'Trust Bank', 'How to contact']
const ANSWERS: { k: RegExp; a: string }[] = [
  { k: /trust|bank|reward/i, a: 'Trust Bank Singapore was an eight-week project. Harbor led planning, UI design and usability tests, and the redesign scored 85 on ease of use.' },
  { k: /game|cove|dashboard/i, a: 'GameCove is an AI game-analytics dashboard Harbor designed as a team project.' },
  { k: /utrada|trading/i, a: 'At UTrada, Harbor worked on product design for a trading platform from 2024 to 2026.' },
  { k: /project|work|portfolio|case/i, a: 'Three featured projects: Trust Bank Singapore, GameCove and UTrada. Scroll to Selected work to see each one.' },
  { k: /contact|email|call|hire|book|reach/i, a: 'You can book a 30-minute call, or email harborkim0328@gmail.com.' },
  { k: /who|about|harbor|background|yourself/i, a: 'Harbor is a product designer with over three years in fintech and e-learning. She started in Fine Art, and now designs end to end, from research to UI.' },
]
const FALLBACK = 'I can tell you about Harbor, her projects, or how to get in touch.'
const answerFor = (q: string) => (ANSWERS.find(x => x.k.test(q))?.a ?? FALLBACK)

export function useVoice() {
  const [mode, setMode] = useState<'idle' | 'listening' | 'speaking'>('idle')
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const rec = useRef<any>(null)
  const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null
  const canListen = !!SR

  const speak = (text: string) => {
    setA(text)
    const synth = window.speechSynthesis
    if (!synth) { setMode('idle'); return }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 1.02
    u.onstart = () => setMode('speaking')
    u.onend = () => setMode('idle')
    u.onerror = () => setMode('idle')
    synth.speak(u)
  }
  const ask = (text: string) => { rec.current?.abort?.(); setQ(text); speak(answerFor(text)) }
  const stop = () => { rec.current?.abort?.(); window.speechSynthesis?.cancel(); setMode('idle') }
  const listen = () => {
    if (!SR) return
    if (mode === 'listening') { rec.current?.stop(); return }
    window.speechSynthesis?.cancel()
    const r = new SR()
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 1
    let finalText = ''
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((x: any) => x[0].transcript).join('')
      setQ(t)
      if (e.results[e.results.length - 1].isFinal) finalText = t
    }
    r.onerror = (e: any) => { setMode('idle'); if (e.error === 'not-allowed') setA('Microphone access is blocked here. Pick a question below instead.') }
    r.onend = () => { if (finalText) speak(answerFor(finalText)); else setMode(m => (m === 'listening' ? 'idle' : m)) }
    rec.current = r
    setA('')
    setMode('listening')
    try { r.start() } catch { setMode('idle') }
  }
  useEffect(() => () => { rec.current?.abort?.(); window.speechSynthesis?.cancel() }, [])
  return { mode, q, a, canListen, ask, stop, listen }
}

export type NavKey = 'projects' | 'about' | undefined

// Shared site header. On the main page it starts transparent over the photo and turns light on scroll;
// on the Projects / About pages it is always light (`solid`).
export function SiteHeader({ current, solid = false }: { current?: NavKey; solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid)
  useEffect(() => {
    if (solid) return
    const on = () => setScrolled(scrollY > 40)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [solid])
  return (
    <header className={'site' + (scrolled || solid ? ' scrolled' : '')}>
      <div className="bar">
        <div className="nav wrap">
          <div className="nav-left">
            <a className="logo" href="#top">harbor</a>
            <nav className="nav-links" aria-label="Main">
              <a href="#/projects" className={current === 'projects' ? 'current' : undefined} aria-current={current === 'projects' ? 'page' : undefined}>Projects</a>
              <a href="#/about" className={current === 'about' ? 'current' : undefined} aria-current={current === 'about' ? 'page' : undefined}>About me</a>
              <span>CV</span>
            </nav>
          </div>
          <div className="nav-right">
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a className="btn-sm" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
      </div>
    </header>
  )
}

export function ClosingCTA() {
  return (
    <section className="cta-sec" id="contact" aria-label="Contact">
      <div className="cta-frame">
        <div className="cta-inner" data-reveal>
          <h2 className="h2 h2-xl">Let’s connect the dots together.</h2>
          <p className="sub-dark">Open to product design roles. A 30-minute call is the quickest way to start.</p>
          <div className="ctas">
            <a className="btn btn-ghost" href="#/projects">See my work</a>
            <a className="btn btn-light" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
        <div className="bars" data-reveal aria-hidden="true">
          {Array.from({ length: BARS }, (_, i) => {
            const h = Math.pow((i + 1) / BARS, 2.6)
            return <i key={i} style={{ '--h': h.toFixed(3), '--i': i } as React.CSSProperties} />
          })}
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="brand">
            <div className="logo">harbor</div>
            <a href={LINKS.email}>harborkim0328@gmail.com</a>
          </div>
          <div className="foot-cols">
            <div className="foot-col"><div className="h">Explore</div><a href="#top">Home</a><a href="#/projects">Projects</a><a href="#/about">About me</a><span>CV</span></div>
            <div className="foot-col"><div className="h">Contact</div><a href={LINKS.email}>Email</a><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a></div>
          </div>
        </div>
        <div className="foot-bottom"><span>© 2026 Harbor Kim. All rights reserved.</span><span>Designed in Figma by Harbor</span></div>
      </div>
    </footer>
  )
}

// Scroll reveals for anything marked data-reveal. Pass a key that changes when the content changes.
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)'))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}

// Aurora voice assistant (fixed bottom-right), shared by every page.
export function VoiceAssistant() {
  const [fab, setFab] = useState(false)
  const [chat, setChat] = useState(false)
  const voice = useVoice()
  useEffect(() => { const c = window.setTimeout(() => setFab(true), 1200); return () => clearTimeout(c) }, [])
  useEffect(() => {
    if (!chat) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setChat(false); voice.stop() } }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [chat])
  return (
    <>
      <div className={'voice-pop' + (chat ? ' open' : '')} role="dialog" aria-label="Ask about Harbor" aria-hidden={!chat}>
        <div className={'orb big' + (voice.mode === 'listening' ? ' live' : voice.mode === 'speaking' ? ' talk' : '')} aria-hidden="true" />
        <div className="voice-status" aria-live="polite">
          {voice.mode === 'listening' ? 'Listening…' : voice.mode === 'speaking' ? 'Speaking…' : voice.canListen ? 'Tap the mic and ask about Harbor' : 'Pick a question'}
        </div>
        <div className="voice-q">{voice.q}</div>
        <div className="voice-a">{voice.a}</div>
        <div className="voice-chips">
          {CHIPS.map(c => <button key={c} tabIndex={chat ? 0 : -1} onClick={() => voice.ask(c)}>{c}</button>)}
        </div>
        <div className="voice-ctrl">
          {voice.canListen && (
            <button className={'mic' + (voice.mode === 'listening' ? ' on' : '')} tabIndex={chat ? 0 : -1} aria-label={voice.mode === 'listening' ? 'Stop listening' : 'Start talking'} onClick={voice.listen}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" width="22" height="22"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </button>
          )}
          <button className="end" tabIndex={chat ? 0 : -1} aria-label="Close" onClick={() => { voice.stop(); setChat(false) }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2" strokeLinecap="round" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </div>
      <button className={'voice-fab' + (fab ? ' show' : '')} aria-label={chat ? 'Close voice assistant' : 'Ask about Harbor'} aria-expanded={chat}
        onClick={() => { if (chat) voice.stop(); setChat(v => !v) }}>
        <span className={'orb' + (voice.mode !== 'idle' ? ' live' : '')} />
      </button>
    </>
  )
}

function ProjectBlock({ p }: { p: Project }) {
  const href = p.href ?? '#projects'
  return (
    <article className="proj" data-reveal>
      <div className="proj-head">
        <h3><span>{p.title}</span><span className="sub">{p.sub}</span></h3>
        <a className="link" href={href}>View project <span className="go">→</span></a>
      </div>
      <div className="proj-frame">
        <div className="proj-info">
          <ul className="proj-rows">
            {p.rows.map(r => <li key={r[0]}><div className="r-t">{r[0]}</div><div className="r-s">{r[1]}</div></li>)}
          </ul>
          <div className="proj-side">
            <div className="proj-note"><span className="dot" /><div><div className="t">{p.note[0]}</div><div className="s">{p.note[1]}</div></div></div>
          </div>
        </div>
        <a className="proj-media" href={href} aria-label={`View ${p.title}`}>
          <div className="shot" style={p.ratio ? { aspectRatio: p.ratio } : undefined}>
            {p.video
              ? <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="metadata" />
              : <img src={p.img} alt={p.alt ?? ''} loading="lazy" />}
            <span className="view">View project →</span>
          </div>
        </a>
      </div>
    </article>
  )
}

export function App() {
  const screenInit = useScreenInit() as { section?: string } | undefined
  const [q, setQ] = useState(0)
  const heroBg = useRef<HTMLDivElement>(null)

  const line2 = useTyped('a product designer, end to end', 'hero', 45, 700)
  useReveal()

  // Hero parallax.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = scrollY
        if (heroBg.current && y < innerHeight * 1.2) heroBg.current.style.transform = `translate3d(0, ${y * 0.25}px, 0)`
      })
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  // Hero quote rotation.
  useEffect(() => {
    if (QUOTES.length < 2) return
    const a = window.setInterval(() => setQ(v => (v + 1) % QUOTES.length), QUOTE_MS)
    return () => clearInterval(a)
  }, [])

  // Screens preview: jump to the requested section on load.
  useEffect(() => {
    const key = screenInit?.section
    if (!key || !SECTION_IDS[key]) return
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(SECTION_IDS[key])
      if (el) scrollTo({ top: el.offsetTop - 64, behavior: 'instant' as ScrollBehavior })
    })
    return () => cancelAnimationFrame(raf)
  }, [screenInit])

  return (
    <div className="hb" id="top">
      <style>{CSS + PAGE_CSS}</style>
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="hero" aria-label="Intro">
        <div className="hero-bg" ref={heroBg}><div className="hero-img" style={{ backgroundImage: `url("${IMG3}hero.jpg")` }} /></div>
        <div className="hero-copy">
          <p className="quote" key={q}>{QUOTES[q]}</p>
          <h1 className="h1">
            <span className="l1">Who is Harbor?</span>
            <span className="sub" aria-label="a product designer, end to end">{line2}<i className="caret" aria-hidden="true" /></span>
          </h1>
          <div className="ctas hero-ctas">
            <a className="btn btn-ghost" href="#projects">See my work</a>
            <a className="btn btn-light" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
      </section>

      {/* ===== Designer skills strip ===== */}
      <div className="strip" id="skills" aria-label="Designer skills">
        <div className="wrap strip-row">
          {SKILLS.map(s => <div className="cell" key={s}>{s}</div>)}
        </div>
      </div>

      <main>
        {/* ===== Selected work — one project per block ===== */}
        <section className="sec projects-sec" id="projects" aria-label="Selected work">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <div>
                <div className="eyebrow">(01) Selected work</div>
                <h2 className="h2">Projects, end to end</h2>
              </div>
              <a className="link" href="#/projects">All projects <span className="go">→</span></a>
            </div>
            {PROJECTS.map(p => <ProjectBlock p={p} key={p.title} />)}
          </div>
        </section>

        <ClosingCTA />
      </main>

      <SiteFooter />
      <VoiceAssistant />
    </div>
  )
}
