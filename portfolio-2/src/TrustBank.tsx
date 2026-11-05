import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'

// Trust Bank case study — same copy, section flow and interactions as the live page
// (harbor-k.github.io/landing_page/trust-bank, source Harbor-K/landing_page/trust-bank),
// with the look moved to the main page's tone: light two-tone headlines, square corners,
// white / off-white / ink bands and numbered eyebrows.
// Interactions kept from the original: soft block reveal (1.2s), header that tucks away on scroll down,
// hero video controls (progress, time, volume; hide after 3s), hover magnifier on the thematic and DVF boards,
// the pinned affinity board that regroups into 3 patterns, HMW notes that pop on, idea cards that bounce in,
// the pinned Deliver showcase (scroll or video end moves 1 → 2 → 3, progress runs around the card border),
// count-up test numbers, the pinned As-is → To-be 3D flip for each fix, and the cursor dot trail.

const A = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/trust-bank/'
const L = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/trust-bank/assets/'
const PROTOTYPE_URL =
  'https://www.figma.com/proto/8cWe2vvqXJcQ3vWBtNqxFe/%F0%9F%94%B5-Trust-Bank_Design?node-id=627-8762&p=f&viewport=-335%2C-955%2C0.14&t=OAe3UV92aMoOUQHu-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=627%3A8762&show-proto-sidebar=1&page-id=200%3A3608'
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1G1L7nXgh53dFV-mELPEmyCd28lPneIIXBH229eu950Q/edit?usp=sharing'
const NEXT_URL = 'https://project-harbor-kim-portfolio-114.magicpatterns.app/#/gamecove'
const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}

const IMG = {
  logo: A + 'logo-on-dark.svg',
  heroVideo: A + 'hero-sfx-v2.mp4', heroPoster: A + 'hero-sfx-v2-poster.jpg',
  processVideo: A + 'process-motion.mp4', processPoster: A + 'process-motion-poster.jpg',
  journeyVideo: A + 'journey-motion.mp4', journeyPoster: A + 'journey-motion-poster.jpg',
  article: A + 'article.png', interview: A + 'interview.png', table: A + 'table.png', thematic: A + 'thematic.png',
  definePhoto: A + 'define-photo.jpg',
  hmw1: A + 'hmw-icon-1.svg', hmw2: A + 'hmw-icon-2.svg', hmw3: A + 'hmw-icon-3.svg',
  dvf: A + 'dvf.png',
  sketch1a: A + 'sketch-1a.png', sketch1b: A + 'sketch-1b.png', sketch2a: A + 'sketch-2a.png?v=2', sketch2b: A + 'sketch-2b.png?v=2', sketch3a: A + 'sketch-3a.png?v=2', sketch3b: A + 'sketch-3b.png?v=2',
  workshop1: A + 'workshop-1.jpg', workshop2: A + 'workshop-2.jpg?v=2',
  deliver1: A + 'deliver-1.mp4', deliver1Poster: A + 'deliver-1-poster.jpg',
  deliver2: L + 'deliver-2-rewards.mp4', deliver2Poster: L + 'deliver-2-rewards-poster.jpg',
  deliver3: A + 'deliver-3.mp4', deliver3Poster: A + 'deliver-3-poster.jpg',
  utVideo: L + 'ut-session.mp4', utPoster: L + 'ut-video-poster.jpg', utSheet: L + 'ut-sheet.png',
  fix1Before: L + 'fix1-asis.webp', fix1After: L + 'fix1-tobe.webp', fix34Before: L + 'fix34-asis.webp', fix34After: L + 'fix34-tobe.webp',
  reflection: A + 'takeaway.jpg',
}

const CHAPTERS = ['Overview', 'Process', 'Discover', 'Define', 'Develop', 'Deliver', 'Test', 'Reflection']

/* ---------- helpers ---------- */

const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/** call `fn` on scroll/resize, once per frame */
function useOnScroll(fn: () => void) {
  const f = useRef(fn); f.current = fn
  useEffect(() => {
    let raf = 0
    const run = () => { raf = 0; f.current() }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
}

/** 0 → 1 as the element scrolls from the bottom of the screen up to its middle (eased) */
function useCountProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [p, setP] = useState(0)
  useOnScroll(() => {
    if (reducedMotion()) { setP(1); return }
    const el = ref.current; if (!el) return
    const t = clamp((innerHeight - el.getBoundingClientRect().top) / (innerHeight * 0.5))
    setP(1 - (1 - t) * (1 - t))
  })
  return [ref, p] as const
}

/** becomes true once, when the element scrolls into view */
function useShownOnce<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reducedMotion() || !('IntersectionObserver' in window)) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold })
    io.observe(el); return () => io.disconnect()
  }, [threshold])
  return [ref, shown] as const
}

function Eyebrow({ n, label }: { n: string; label: string }) {
  return <div className="eyebrow">({n}) {label}</div>
}

function Head({ kicker, children, className = '' }: { kicker?: string; children: React.ReactNode; className?: string }) {
  return (
    <h2 className={'tb-h2 ' + className}>
      {kicker && <span className="k">{kicker}</span>}
      {children}
    </h2>
  )
}

function Loop({ src, poster, ratio, label, bg }: { src: string; poster: string; ratio: string; label: string; bg?: string }) {
  return (
    <div className="media" style={{ aspectRatio: ratio, background: bg }}>
      <video src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-label={label} />
    </div>
  )
}

/* ---------- cursor dot trail (same as the live page) ---------- */

function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const reduce = reducedMotion()
    const BASE = '#ffffff', ACCENT = '#1fb6d5', TRAIL_MS = 260, SPRING = 0.14, DAMPING = 0.7
    const isInteractive = (el: Element | null) => {
      if (!el || !(el instanceof Element)) return false
      if (el.closest('a, button, [role="button"], label, summary')) return true
      const c = getComputedStyle(el).cursor
      return c === 'pointer' || c === 'crosshair' || c === 'zoom-in'
    }
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1)
      canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr)
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size(); addEventListener('resize', size)
    const mouse = { x: -100, y: -100 }, dot = { x: -100, y: -100, vx: 0, vy: 0 }
    const tail: { x: number; y: number; t: number }[] = []
    let visible = 0, present = false, first = true, accent = false, grow = 0, raf = 0
    const onPoint = (e: MouseEvent) => {
      if ((e as PointerEvent).pointerType === 'touch') { present = false; return }
      if (!Number.isFinite(e.clientX) || (e.clientX === 0 && e.clientY === 0 && e.type === 'wheel')) { present = true; return }
      mouse.x = e.clientX; mouse.y = e.clientY; present = true
      if (first) { dot.x = mouse.x; dot.y = mouse.y; first = false }
      accent = isInteractive(e.target as Element)
    }
    const onScroll = () => { if (present && !first) accent = isInteractive(document.elementFromPoint(mouse.x, mouse.y)) }
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget) present = false }
    const tick = (now: number) => {
      if (reduce) { dot.x = mouse.x; dot.y = mouse.y }
      else {
        dot.vx = (dot.vx + (mouse.x - dot.x) * SPRING) * DAMPING; dot.vy = (dot.vy + (mouse.y - dot.y) * SPRING) * DAMPING
        dot.x += dot.vx; dot.y += dot.vy
      }
      visible += ((present ? 1 : 0) - visible) * 0.15
      grow += ((accent ? 1 : 0) - grow) * 0.2
      tail.push({ x: dot.x, y: dot.y, t: now })
      while (tail.length && now - tail[0].t > TRAIL_MS) tail.shift()
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (visible > 0.01) {
        const color = accent ? ACCENT : BASE
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'
        if (!reduce) for (let i = 1; i < tail.length; i++) {
          const a = tail[i - 1], b = tail[i]
          if (Math.hypot(b.x - a.x, b.y - a.y) < 0.2) continue
          const k = i / tail.length
          ctx.globalAlpha = visible * k * 0.9; ctx.lineWidth = 0.4 + k * 2.2
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
        ctx.globalAlpha = visible
        ctx.beginPath(); ctx.arc(dot.x, dot.y, 3.5 + grow * 1.5, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const opts = { passive: true, capture: true } as AddEventListenerOptions
    const types = ['pointermove', 'mousemove', 'pointerover', 'pointerdown', 'mousedown', 'wheel']
    types.forEach(t => addEventListener(t, onPoint as EventListener, opts))
    addEventListener('scroll', onScroll, opts); document.addEventListener('mouseout', onOut, opts)
    return () => {
      cancelAnimationFrame(raf); removeEventListener('resize', size)
      types.forEach(t => removeEventListener(t, onPoint as EventListener, opts))
      removeEventListener('scroll', onScroll, opts); document.removeEventListener('mouseout', onOut, opts)
    }
  }, [])
  return <canvas ref={ref} className="cursor-trail" aria-hidden="true" />
}

/* ---------- hover magnifier for images marked data-zoom (same as the live page) ---------- */

function useMagnifier(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !matchMedia('(pointer: fine)').matches || reducedMotion()) return
    type Z = { s: number; ts: number; ox: number; oy: number; tox: number; toy: number }
    const HOVER_SCALE = 1.8
    const zooms = new Map<HTMLImageElement, Z>()
    let active: HTMLImageElement | null = null, raf = 0
    const local = (img: HTMLImageElement, z: Z | undefined, cx: number, cy: number) => {
      const r = img.getBoundingClientRect(), s = z?.s ?? 1, ox = z?.ox ?? 0, oy = z?.oy ?? 0
      const bl = r.left - ox * (1 - s), bt = r.top - oy * (1 - s)
      return { x: clamp(cx - bl, 0, img.offsetWidth), y: clamp(cy - bt, 0, img.offsetHeight) }
    }
    const release = () => { if (active) { const z = zooms.get(active); if (z) z.ts = 1 } active = null }
    const onMove = (e: PointerEvent) => {
      const img = (e.target as HTMLElement)?.closest?.('img') as HTMLImageElement | null
      if (img && root.contains(img) && img.dataset.zoom === 'true') {
        if (active !== img) { release(); active = img }
        let z = zooms.get(img)
        const p = local(img, z, e.clientX, e.clientY)
        if (!z) { z = { s: 1, ts: HOVER_SCALE, ox: p.x, oy: p.y, tox: p.x, toy: p.y }; zooms.set(img, z); img.style.transition = 'none'; img.style.willChange = 'transform, clip-path' }
        z.ts = HOVER_SCALE; z.tox = p.x; z.toy = p.y
      } else release()
    }
    const clear = (img: HTMLImageElement) => { img.style.transform = ''; img.style.transformOrigin = ''; img.style.clipPath = ''; img.style.transition = ''; img.style.willChange = '' }
    const tick = () => {
      zooms.forEach((z, img) => {
        z.s += (z.ts - z.s) * 0.14; z.ox += (z.tox - z.ox) * 0.2; z.oy += (z.toy - z.oy) * 0.2
        if (z.ts === 1 && z.s < 1.002) { clear(img); zooms.delete(img); return }
        const w = img.offsetWidth, h = img.offsetHeight, k = 1 - 1 / z.s
        img.style.transformOrigin = `${z.ox}px ${z.oy}px`
        img.style.transform = `scale(${z.s})`
        img.style.clipPath = `inset(${z.oy * k}px ${(w - z.ox) * k}px ${(h - z.oy) * k}px ${z.ox * k}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('mouseleave', release)
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', onMove); document.removeEventListener('mouseleave', release); zooms.forEach((_, img) => clear(img)); zooms.clear() }
  }, [rootRef])
}

/* ---------- hero motion with sound: always starts muted; controls show 3s, then on hover ---------- */

const fmt = (t: number) => (!isFinite(t) ? '0:00' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`)

function SoundMotion() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [intro, setIntro] = useState(true)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const show = intro || hover || focus
  useEffect(() => {
    const v = ref.current; if (!v) return
    v.volume = 0.5; v.muted = true; v.play().catch(() => {})
    const t = setTimeout(() => setIntro(false), 3000)
    return () => clearTimeout(t)
  }, [])
  const togglePlay = () => { const v = ref.current; if (!v) return; if (v.paused) v.play().catch(() => {}); else v.pause() }
  const toggleMute = () => { const v = ref.current; if (!v) return; v.muted = !v.muted; if (!v.muted && v.volume === 0) v.volume = 0.5; setMuted(v.muted); setVolume(v.volume) }
  const changeVolume = (val: number) => { const v = ref.current; if (!v) return; v.volume = val; v.muted = val === 0; setVolume(val); setMuted(v.muted) }
  const seek = (val: number) => { const v = ref.current; if (!v || !duration) return; v.currentTime = val; setTime(val) }
  const shownVolume = muted ? 0 : volume
  const pct = duration ? (time / duration) * 100 : 0
  return (
    <div className="hero-video" data-reveal onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)} onBlurCapture={() => setFocus(false)}>
      <video ref={ref} src={IMG.heroVideo} poster={IMG.heroPoster} muted loop playsInline preload="auto"
        aria-label="Trust Bank rewards: linking FairPrice in one tap and watching every payment fill the Linkpoints bar"
        onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDuration(e.currentTarget.duration)} />
      <div className={'hv-controls' + (show ? ' show' : '')}>
        <input type="range" min={0} max={duration || 0} step={0.01} value={time} onChange={e => seek(Number(e.target.value))}
          aria-label="Video progress" className="tb-range wide" style={{ '--fill': `${pct}%` } as React.CSSProperties} />
        <div className="hv-row">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="hv-btn">
            {playing
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>}
          </button>
          <span className="hv-time">{fmt(time)} / {fmt(duration)}</span>
          <div className="hv-vol">
            <button type="button" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Mute'} className="hv-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" />
                {shownVolume === 0
                  ? <><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></>
                  : <><path d="M15.5 8.5a5 5 0 0 1 0 7" />{shownVolume > 0.5 && <path d="M19 5a10 10 0 0 1 0 14" />}</>}
              </svg>
            </button>
            <input type="range" min={0} max={1} step={0.01} value={shownVolume} onChange={e => changeVolume(Number(e.target.value))}
              aria-label="Volume" className="tb-range vol" style={{ '--fill': `${shownVolume * 100}%` } as React.CSSProperties} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- sections ---------- */

function Hero() {
  return (
    <section className="tb-hero" id="top" data-chapter="Trust Bank">
      <div className="wrap">
        <div data-reveal>
          <img className="tb-logo" src={IMG.logo} alt="trust" />
          <h1 className="tb-h1">Turning hidden rewards<span className="sub">into everyday loyalty</span></h1>
          <p className="tb-lead">Helping people find and use their rewards in a digital bank<br />Trust Bank (Singapore) · UX case study</p>
        </div>
        <SoundMotion />
        <div className="tb-meta">
          <div data-reveal style={{ '--d': 0 } as React.CSSProperties}><div className="m-k">TIMELINE</div><p>8 weeks June – August 2026</p></div>
          <div data-reveal style={{ '--d': 1 } as React.CSSProperties}><div className="m-k">TEAM &amp; ROLE</div><p>2 designers<br />I led: Planning, UI Design, Usability test<br />Together: Research synthesis ideation, Testing</p></div>
          <div data-reveal style={{ '--d': 2 } as React.CSSProperties}><div className="m-k">INDUSTRY</div><p>Fintech, Digital banking, Mobile app</p></div>
        </div>
      </div>
    </section>
  )
}

function Overview() {
  const stats = [['23/30', 'tasks done without help'], ['85', 'ease-of-use score (A+)'], ['6/6', 'said they’d keep using it']]
  return (
    <section className="sec" data-chapter="Overview">
      <div className="wrap">
        <div data-reveal><Eyebrow n="01" label="Overview" /></div>
        <div className="ov-rows">
          <div className="ov-row" data-reveal>
            <div className="ov-k">The problem</div>
            <p className="tb-body">Trust Bank works with FairPrice, a supermarket chain. Over 1 million people joined Trust Bank, 70% through a friend’s invite bonus, but only 17% made it their main bank. So we interviewed users to find out why. Of the problems we found, we focused on rewards: FairPrice rewards are Trust Bank’s biggest strength, but users weren’t using them.</p>
          </div>
          <div className="ov-row" data-reveal>
            <div className="ov-k">Solution</div>
            <p className="tb-body">If users can find their rewards and know how to use them, they have a reason to come back. That builds loyalty. So we set two goals. Easy to find: show each user the rewards that fit them. Easy to use: show the rules and the next step.</p>
          </div>
          <div className="ov-row" data-reveal>
            <div className="ov-k">Impact</div>
            <div className="stats">
              {stats.map(([v, l]) => (
                <div className="stat" key={l}><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="sec off" data-chapter="Process">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="02" label="Process" />
          <Head>From problem to solution</Head>
        </div>
        <div className="mt-60" data-reveal>
          <Loop src={IMG.processVideo} poster={IMG.processPoster} ratio="1440 / 824" bg="#ecf7fd" label="Double diamond: Discover, Define, Develop, Deliver with the methods used in each step" />
        </div>
      </div>
    </section>
  )
}

function Discover() {
  return (
    <section className="sec" data-chapter="Discover">
      <div className="wrap">
        <div className="two">
          <div data-reveal>
            <Eyebrow n="03" label="Discover" />
            <Head kicker="What reports said">Only 17% use it as their main bank</Head>
            <p className="tb-body mt-24">Reports showed how few users make it their main bank, but not why.<br />So we wanted to know, why don’t users make Trust Bank their main bank?</p>
          </div>
          <figure className="fig pad-top" data-reveal style={{ '--d': 1 } as React.CSSProperties}>
            <img src={IMG.article} alt="News article: only 17% of Trust Bank users use it as their main bank" loading="lazy" />
            <figcaption>Source: The Asian Banker (May 2026)</figcaption>
          </figure>
        </div>

        <div className="two mt-160">
          <div data-reveal>
            <Head kicker="What users said">Rewards got them in, but not back</Head>
            <p className="tb-body mt-24">We interviewed 3 users. Some reasons were out of our hands. For example, their salary went to another bank. But one problem was about Trust Bank’s biggest strength: rewards. All 3 joined for an invite bonus or promo. But the rewards didn’t bring them back.</p>
            <img className="mt-40 block" src={IMG.table} alt="Interviewees: 3 participants, their main bank and how they used rewards" loading="lazy" />
          </div>
          <figure className="fig pad-top-lg" data-reveal style={{ '--d': 1 } as React.CSSProperties}>
            <img src={IMG.interview} alt="Interview session recording, 1 of 3" loading="lazy" />
          </figure>
        </div>

        <figure className="fig mt-120 zoom-fig" data-reveal>
          <img src={IMG.thematic} alt="Thematic analysis of 3 interviews: 5 themes, 19 codes and quotes" loading="lazy" data-zoom="true" />
          <figcaption>Thematic analysis · 3 interviews</figcaption>
        </figure>

        <div className="two mt-80">
          <div data-reveal><Head kicker="What the data said">Points earned, but not used</Head></div>
          <div data-reveal style={{ '--d': 1 } as React.CSSProperties}>
            <p className="tb-body">Our 3 users barely used Trust Bank’s rewards. So we went back to the data. How many points do Trust Bank users actually earn?</p>
            <p className="tb-body mt-20">Trust Bank already gives out over 9 billion points, but the users we spoke to didn’t see them as a reason to come back. Its biggest strength was going to waste. Was our guess right? We went back to our interview notes to check.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Define · affinity board → 3 patterns, driven by scroll (same as the live page) ---------- */

const AF_FRAME_W = 1440, AF_BOARD_W = 1320, AF_BOARD_X = 72
const HAND = '"Caveat", "Helvetica Neue", Helvetica, Arial, sans-serif'
const NOTE_FONT = '"Kalam", "Helvetica Neue", Helvetica, Arial, sans-serif'
const PEN = '#2a2a2e'
const NC = { g: '#93dbc7', p: '#f6a9bc', v: '#a897ec' } as const
const DOT = { b: '#2f80ed', g: '#27ae60' } as const
type Dot = [number, number, keyof typeof DOT]
type AfNote = { t: string; c: keyof typeof NC; a: [number, number, number]; b?: [number, number, number]; dots?: Dot[] }
const AF_NOTES: AfNote[] = [
  { t: 'From a friend', c: 'g', a: [86, 220, -3], dots: [[73, 70, 'b']] },
  { t: 'No ads online', c: 'p', a: [186, 220, -1], b: [292, 330, -2], dots: [[75, 67, 'g']] },
  { t: 'FairPrice deal came late', c: 'v', a: [92, 314, 1], b: [180, 330, 2] },
  { t: 'eSIM? didn’t know', c: 'p', a: [192, 314, 3], dots: [[69, 63, 'g'], [80, 62, 'b']] },
  { t: 'Never saw live chat', c: 'g', a: [86, 408, -2], b: [292, 226, 2] },
  { t: 'No rewards page?', c: 'v', a: [186, 408, 0], b: [180, 226, -3], dots: [[76, 66, 'g']] },
  { t: 'Referral cash = tempting', c: 'g', a: [328, 220, 1], b: [1012, 330, -2] },
  { t: '200 pts = 1 tea', c: 'v', a: [428, 220, 3], b: [900, 226, -3], dots: [[79, 62, 'b']] },
  { t: 'Saw a train ad', c: 'p', a: [334, 314, -2], dots: [[73, 69, 'g']] },
  { t: 'Hesitates at $50+ coupons', c: 'g', a: [434, 314, 0], b: [1012, 226, 2] },
  { t: 'Rewards = FairPrice app', c: 'g', a: [568, 220, -2], b: [540, 226, -3], dots: [[62, 68, 'g'], [73, 69, 'b']] },
  { t: 'PayNow taken by DBS', c: 'v', a: [668, 220, 0], b: [652, 226, 2] },
  { t: 'Weekly spending only', c: 'p', a: [574, 314, 2], dots: [[78, 63, 'g']] },
  { t: 'Shopee + bills only', c: 'v', a: [674, 314, -3] },
  { t: 'Interest rate first', c: 'p', a: [568, 408, -1], b: [900, 330, 2], dots: [[74, 67, 'b']] },
  { t: 'Left after FairPrice change', c: 'p', a: [804, 220, 2], dots: [[79, 63, 'g']] },
  { t: 'No low-balance alert', c: 'v', a: [904, 220, -3] },
  { t: 'Icons hard to read', c: 'g', a: [810, 314, -1], dots: [[64, 67, 'g'], [75, 67, 'b']] },
  { t: 'App confusing at first', c: 'v', a: [910, 314, 1] },
  { t: 'Show budget per place?', c: 'g', a: [804, 408, 3], dots: [[80, 62, 'g']] },
  { t: 'PayNow QR', c: 'g', a: [1045, 220, -1] },
  { t: 'DBS or OCBC', c: 'v', a: [1145, 220, 1], dots: [[77, 65, 'b']] },
  { t: 'Family uses DBS', c: 'g', a: [1051, 314, 3], b: [540, 330, 2], dots: [[79, 62, 'g']] },
  { t: 'FX on Google', c: 'p', a: [1151, 314, -2] },
  { t: 'Bank per role', c: 'p', a: [1045, 408, 0], b: [652, 330, -2], dots: [[65, 66, 'g'], [76, 66, 'b']] },
]
const AF_PEOPLE: { t: string; c: keyof typeof NC; x: number; r: number }[] = [
  { t: 'P1 · Student, Sri Lanka', c: 'g', x: 450, r: -2 },
  { t: 'P2 · Engineer, lapsed', c: 'p', x: 594, r: 2 },
  { t: 'P3 · Student, Philippines', c: 'v', x: 738, r: -1 },
]
const AF_GROUPS: { t: string; x: number; r: number }[] = [
  { t: 'Discoverability\n& Awareness', x: 86, r: -2 },
  { t: 'Coupon Choice\n& Decisions', x: 328, r: 1 },
  { t: 'Actual Usage\nExperience', x: 568, r: -2 },
  { t: 'Pain Points &\nImprovements', x: 804, r: 1 },
  { t: 'SG Financial\nHabits', x: 1045, r: -2 },
]
const AF_PATTERNS: { n: string; t: string; x: number; r: number; color: string; cap: string }[] = [
  { n: '1', t: 'Unseen', x: 168, r: -2, color: '#2f80ed', cap: 'Rewards were in Trust Bank,\nbut users didn’t see them.' },
  { n: '2', t: 'Elsewhere', x: 528, r: 1, color: '#e2574c', cap: 'Points were checked in the\nFairPrice app, not Trust.' },
  { n: '3', t: 'Not worth it', x: 888, r: -2, color: '#27ae60', cap: 'A 200-point reward felt\nworse than paying under $5.' },
]
const LASSO = 'M142.25 2.20823C242.25 -1.79177 288.25 52.2082 284.25 132.208C280.25 222.208 222.25 276.208 132.25 274.208C42.2501 272.208 -1.74986 212.208 2.25014 132.208C6.25014 52.2082 62.2501 6.20823 154.25 8.20823'
const UNDERLINE = 'M1.10156 4.09961C39.1016 -0.900391 79.1016 7.09961 147.102 1.09961'
const SCRIBBLE = 'M1.10156 9.20048C191.102 -4.79952 411.102 21.2005 631.102 3.20048C751.102 -4.79952 831.102 13.2005 881.102 5.20048'
const segP = (p: number, from: number, to: number) => clamp((p - from) / (to - from))
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const mix = (a: number, b: number, t: number) => a + (b - a) * t

function Written({ p, children, style }: { p: number; children: React.ReactNode; style: React.CSSProperties }) {
  return <div style={{ ...style, clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`, opacity: p > 0 ? 1 : 0 }}>{children}</div>
}

function Sticky({ text, color, x, y, w, h, r, dots, dotOpacity = 1, lift = 0, style }: {
  text: string; color: string; x: number; y: number; w: number; h: number; r: number; dots?: Dot[]; dotOpacity?: number; lift?: number; style?: React.CSSProperties
}) {
  return (
    <div className="af-sticky" style={{ left: x, top: y, width: w, height: h, background: color, transform: `rotate(${r}deg) scale(${1 + lift * 0.06})`, boxShadow: `0 ${5 + lift * 10}px ${8 + lift * 16}px rgba(0,0,0,${0.16 + lift * 0.06})`, zIndex: lift > 0.01 ? 2 : 1, ...style }}>
      <span className="af-tape" />
      <p style={{ fontFamily: NOTE_FONT, color: PEN }}>{text}</p>
      {dots?.map(([dx, dy, c], k) => <span key={k} className="af-dot" style={{ left: dx, top: dy, background: DOT[c], opacity: dotOpacity }} />)}
    </div>
  )
}

function AffinityScroll() {
  const outer = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => {
      const w = box.current?.clientWidth ?? AF_FRAME_W
      setScale(Math.min(1, w / AF_FRAME_W, Math.max((innerHeight - 120) / 1000, 0.4)))
    }
    fit()
    const ro = new ResizeObserver(fit); if (box.current) ro.observe(box.current)
    addEventListener('resize', fit)
    return () => { ro.disconnect(); removeEventListener('resize', fit) }
  }, [])
  useOnScroll(() => {
    const el = outer.current; if (!el) return
    const travel = el.offsetHeight - innerHeight
    setP(travel > 0 ? clamp(-el.getBoundingClientRect().top / travel) : 1)
  })
  const fade = easeIO(segP(p, 0.1, 0.3))
  const move = (i: number) => easeIO(segP(p, 0.18 + (i % 4) * 0.03, 0.5 + (i % 4) * 0.03))
  const grow = easeIO(segP(p, 0.2, 0.5))
  const titles = segP(p, 0.5, 0.6)
  const draw = (i: number) => easeIO(segP(p, 0.52 + i * 0.05, 0.66 + i * 0.05))
  const write = (i: number) => segP(p, 0.68 + i * 0.05, 0.78 + i * 0.05)
  const scribble = segP(p, 0.84, 0.9)
  const last = segP(p, 0.88, 0.97)
  const boardY = Math.round(mix(110, 143, grow)), boardH = Math.round(mix(604, 737, grow)), frameH = Math.round(mix(769, 943, grow))
  const done = p > 0.5

  return (
    <div ref={outer} className="af-outer" style={{ height: `calc(${Math.round(943 * scale)}px + 300vh)` }}>
      <div className="af-pin" style={{ top: `max(90px, calc(50vh - ${Math.round((943 * scale) / 2 + 20)}px))` }}>
        <div ref={box} className="af-box" style={{ height: Math.round(frameH * scale) }}>
          <div className="af-frame" style={{ width: AF_FRAME_W, height: frameH, marginLeft: -AF_FRAME_W / 2, transform: `scale(${scale})` }} role="img"
            aria-label="Affinity diagram: 42 notes from 3 interviews grouped into 5 topics, then into 3 patterns. 1 Unseen: rewards were in Trust Bank, but users didn’t see them. 2 Elsewhere: points were checked in the FairPrice app, not Trust. 3 Not worth it: a 200-point reward felt worse than paying under $5. So users never came back for rewards.">
            <p className="af-title" style={{ fontFamily: HAND, color: PEN }}>Affinity diagram · 42 notes from 3 interviews</p>
            <div className="af-board" style={{ left: AF_BOARD_X, top: boardY, width: AF_BOARD_W, height: boardH }}>
              <div className="af-inner">
                <span className="af-glare" style={{ left: 930, width: 90 }} />
                <span className="af-glare" style={{ left: 1060, width: 30 }} />
                {AF_PEOPLE.map(s => <Sticky key={s.t} text={s.t} color={NC[s.c]} x={s.x} y={30} w={130} h={70} r={s.r} />)}
                {AF_GROUPS.map(g => (
                  <div key={g.t} className="af-abs" style={{ left: g.x, top: 128, opacity: 1 - fade, transform: `translateY(${-fade * 10}px)` }}>
                    <p className="af-group" style={{ fontFamily: HAND, color: PEN, transform: `rotate(${g.r}deg)` }}>{g.t}</p>
                    <svg className="af-under" width="149" height="6" viewBox="0 0 149 6" fill="none" aria-hidden="true"><path d={UNDERLINE} stroke={PEN} strokeWidth="2.2" strokeLinecap="round" /></svg>
                  </div>
                ))}
                {AF_PATTERNS.map((pt, i) => (
                  <React.Fragment key={pt.t}>
                    <p className="af-pattern" style={{ left: pt.x, top: 132, fontFamily: HAND, color: PEN, opacity: titles, transform: `rotate(${pt.r}deg) translateY(${(1 - titles) * 10}px)` }}>{pt.n}{'  '}{pt.t}</p>
                    <svg className="af-abs" style={{ left: 146 + i * 360, top: 206 }} width="287" height="277" viewBox="0 0 287 277" fill="none" aria-hidden="true">
                      <path d={LASSO} stroke={pt.color} strokeWidth="4" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(i)} />
                    </svg>
                    <Written p={write(i)} style={{ position: 'absolute', left: 162 + i * 360, top: 500 }}>
                      <p className="af-cap" style={{ fontFamily: HAND, color: PEN }}>{pt.cap}</p>
                    </Written>
                  </React.Fragment>
                ))}
                {AF_NOTES.map((n, i) => {
                  if (!n.b) return <Sticky key={n.t} text={n.t} color={NC[n.c]} x={n.a[0]} y={n.a[1]} w={96} h={88} r={n.a[2]} dots={n.dots} dotOpacity={1} style={{ opacity: 1 - fade, transform: `rotate(${n.a[2]}deg) scale(${1 - fade * 0.15})` }} />
                  const t = move(i)
                  return <Sticky key={n.t} text={n.t} color={NC[n.c]} x={Math.round(mix(n.a[0], n.b[0], t))} y={Math.round(mix(n.a[1], n.b[1], t))} w={Math.round(mix(96, 104, t))} h={Math.round(mix(88, 92, t))} r={mix(n.a[2], n.b[2], t)} dots={n.dots} dotOpacity={1 - fade} lift={Math.sin(t * Math.PI)} />
                })}
                <svg className="af-abs" style={{ left: 220, top: 614 }} width="883" height="11" viewBox="0 0 883 11" fill="none" aria-hidden="true">
                  <path d={SCRIBBLE} stroke={PEN} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2 9" style={{ clipPath: `inset(0 ${(1 - scribble) * 100}% 0 0)` }} />
                </svg>
                <Written p={last} style={{ position: 'absolute', left: 420, top: 636 }}>
                  <p className="af-last" style={{ fontFamily: HAND, color: PEN }}>→ So users never came back for rewards</p>
                </Written>
              </div>
            </div>
          </div>
        </div>
        <div className="af-caption">
          <p style={{ opacity: done ? 0 : 1 }}>Colours = interviewees · Dots = said more than once</p>
          <p style={{ opacity: done ? 1 : 0 }}>Each circle = a pattern seen in 2+ interviews</p>
        </div>
      </div>
    </div>
  )
}

const HMW = [
  { n: 'HMW 1', q: 'Show the right reward just before users buy?', icon: IMG.hmw1 },
  { n: 'HMW 2', q: 'Show the rewards users want at a glance?', icon: IMG.hmw2 },
  { n: 'HMW 3', q: 'Make collecting points feel worth it?', icon: IMG.hmw3 },
]

/** 3 HMW notes that pop on one, two, three like notes slapped on a wall */
function HmwNotes() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.35)
  const tilt = [-3, 2, -2]
  return (
    <div ref={ref} className="hmw-cards">
      {HMW.map((h, i) => (
        <div className="hmw-card" key={h.n} style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'scale(1) rotate(0deg)' : `scale(0.6) rotate(${tilt[i]}deg) translateY(30px)`,
          transition: `opacity 0.4s ease ${i * 0.5}s, transform 0.8s cubic-bezier(0.34, 1.8, 0.64, 1) ${i * 0.5}s, border-color .3s, box-shadow .4s`,
        }}>
          <div className="h-n">{h.n}</div>
          <p className="h-q">{h.q}</p>
          <div className="h-foot"><span>Harbor Kim</span><img src={h.icon} alt="" aria-hidden="true" /></div>
        </div>
      ))}
    </div>
  )
}

function Define() {
  return (
    <section className="off" data-chapter="Define">
      <div className="wrap sec-pad">
        <div className="two">
          <div data-reveal>
            <Eyebrow n="04" label="Define" />
            <Head kicker="3 patterns:">Unseen, Elsewhere, Not worth it</Head>
            <p className="tb-body mt-24">To check our guess, we went back to our interview notes. We wrote each thing users said on a note. Then we grouped similar notes. 3 patterns came up more than once.</p>
          </div>
          <figure className="fig" data-reveal style={{ '--d': 1 } as React.CSSProperties}>
            <img className="cover" src={IMG.definePhoto} alt="Harbor and her teammate grouping interview notes on a glass board" loading="lazy" style={{ aspectRatio: '613 / 358' }} />
          </figure>
        </div>
        <div className="mt-100"><AffinityScroll /></div>
      </div>

      <div className="statement">
        <div className="wrap" data-reveal>
          <div className="m-k light">PROBLEM STATEMENT</div>
          <p className="st-text">Users are not aware of the rewards system.<br />So the business <em>fails to earn loyalty</em>.</p>
        </div>
      </div>

      <div className="wrap sec-pad">
        <div data-reveal>
          <Head kicker="Two personas, one journey">Both get stuck at first use</Head>
          <p className="tb-body mt-24 w-700">Who has this problem, and when do rewards get lost? We made 2 personas from our interviews. A persona is an example user built from real interview answers. Mei is a student. Daniel is an engineer.</p>
        </div>
        <figure className="fig mt-60" data-reveal>
          <Loop src={IMG.journeyVideo} poster={IMG.journeyPoster} ratio="1504 / 634" bg="#ebf7fc" label="Journey map for Mei and Daniel across 5 stages: both drop at first use, the breaking point" />
          <figcaption>Quotes are paraphrased from our interviews, not word for word.</figcaption>
        </figure>

        <div className="hmw mt-120">
          <div data-reveal>
            <Head>HOW MIGHT WE</Head>
            <p className="tb-body mt-24">Both personas get stuck at first use.<br />That is when rewards feel scattered and unclear.<br />We turned this into 3 questions for our ideas:</p>
          </div>
          <HmwNotes />
        </div>
      </div>
    </section>
  )
}

const IDEAS = [
  { t: 'Coupons that find you', pain: 'Benefits don’t fit daily spending', d: 'An alert near the store. Tapping the card applies the coupon.', sk: [IMG.sketch1a, IMG.sketch1b] },
  { t: 'One rewards hub', pain: 'Rewards are scattered and unclear', d: 'Every reward on one page, in clear sections.', sk: [IMG.sketch2a, IMG.sketch2b] },
  { t: 'Points you can see grow', pain: 'Linkpoints don’t feel worth collecting', d: 'A bar to the next reward, a one-tap FairPrice link, and a widget.', sk: [IMG.sketch3a, IMG.sketch3b] },
]

/** 3 idea cards that bounce in one after another */
function IdeaCards() {
  const [ref, shown] = useShownOnce<HTMLDivElement>(0.25)
  return (
    <div ref={ref} className="ideas mt-100">
      {IDEAS.map((c, i) => (
        <article className="idea" key={c.t} style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.94)',
          transition: `opacity 0.8s ease ${i * 0.35}s, transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.35}s, border-color .3s, box-shadow .4s`,
        }}>
          <header><span className="i-n">0{i + 1}</span><h3><span className="sr">Idea {i + 1}: </span>{c.t}</h3></header>
          <div className="i-sk">{c.sk.map((s, k) => <img key={s} src={s} alt={`Hand sketch ${k + 1} for idea ${i + 1}`} loading="lazy" />)}</div>
          <dl>
            <dt>Pain point</dt><dd className="pain">{c.pain}</dd>
            <dt>Our idea</dt><dd>{c.d}</dd>
          </dl>
        </article>
      ))}
    </div>
  )
}

function Develop() {
  return (
    <section className="sec" data-chapter="Develop">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="05" label="Develop" />
          <Head kicker="3 ideas,">each from a pain point we found</Head>
          <p className="tb-body mt-24 w-700">Our 3 questions gave us 26 ideas. We mapped each one by how important it was and whether we had evidence for it. 6 passed, and we checked them against DVF: Do users want it? Does it help the bank? Can we build it?</p>
        </div>
        <figure className="fig mt-60 zoom-fig" data-reveal>
          <img src={IMG.dvf} alt="DVF assumption map: 25 ideas sorted by importance and evidence, 6 passed" loading="lazy" data-zoom="true" />
          <figcaption>DVF assumption map · 26 ideas, 6 passed</figcaption>
        </figure>

        <p className="tb-body mt-100 w-760" data-reveal>Then we sketched 1 idea for each pain point. 2 came from the 6 passed ideas. We added a third for question 3, about points. Finding 3 had already shown users needed it.</p>

        <IdeaCards />
        <p className="cap mt-20">Our hand sketches. Ideas 1–3 answer questions 1–3 above.</p>

        <div className="two-img mt-60">
          <img data-reveal src={IMG.workshop1} alt="Harbor sketching idea screens with her teammate" loading="lazy" />
          <img data-reveal style={{ '--d': 1 } as React.CSSProperties} src={IMG.workshop2} alt="The team reviewing paper sketches together" loading="lazy" />
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  { t: 'Coupons that find you', d: 'Near a store, the right coupon pops up. One tap adds it to your card. Then it’s used automatically when you pay.', v: IMG.deliver1, poster: IMG.deliver1Poster, label: 'Lock-screen coupon alert, one tap adds the Kopitiam coupon to the Trust card', caption: 'Alert near a store' },
  { t: 'One rewards hub', d: 'Points, quests, coupons and stamps sit on one page. Trust+, the premium level, sat at the bottom in this version — testing moved it to the top.', v: IMG.deliver2, poster: IMG.deliver2Poster, label: 'Adding the LinkPoints widget, then the Rewards page with points, quests, coupons, stamps and Trust+ on one screen', caption: 'Rewards hub' },
  { t: 'Points you can see grow', d: 'A bar shows how far you are from the next level. You can link FairPrice in one tap. A widget shows your points without opening the app.', v: IMG.deliver3, poster: IMG.deliver3Poster, label: 'Linking FairPrice in one tap and earning 50 points', caption: 'Points bar' },
]

/** progress drawn around a (square) card border, starting top-left, clockwise, as the video plays */
function ProgressBorder({ progress }: { progress: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const card = ref.current?.parentElement; if (!card) return
    const measure = () => setSize({ w: card.offsetWidth, h: card.offsetHeight })
    measure(); const ro = new ResizeObserver(measure); ro.observe(card); return () => ro.disconnect()
  }, [])
  const w = Math.max(0, size.w - 2), h = Math.max(0, size.h - 2), per = 2 * (w + h)
  return (
    <svg ref={ref} aria-hidden="true" className="progress-border" style={{ width: size.w, height: size.h }}>
      {size.w > 0 && <rect x={1} y={1} width={w} height={h} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - clamp(progress))} style={{ transition: 'stroke-dashoffset 0.3s linear' }} />}
    </svg>
  )
}

/**
 * Deliver: 3 feature cards on the left, the phone plays that feature's screen recording on the right.
 * The block is pinned while you scroll through it; scrolling moves 1 → 2 → 3. When a video ends the next starts (3 → 1 loops).
 */
function DeliverShowcase() {
  const outer = useRef<HTMLDivElement>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [prog, setProg] = useState(0)
  const lastStep = useRef(0)
  useOnScroll(() => {
    const el = outer.current; if (!el) return
    const r = el.getBoundingClientRect(), travel = el.offsetHeight - innerHeight
    if (travel <= 0 || r.top > 0 || r.bottom < innerHeight) return
    const step = Math.min(2, Math.floor((-r.top / travel) * 3))
    if (step !== lastStep.current) { lastStep.current = step; setActive(step) }
  })
  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return
      if (i === active) { v.currentTime = 0; v.play().catch(() => {}) } else v.pause()
    })
    setProg(0)
  }, [active])
  return (
    <div ref={outer} className="deliver-outer mt-60">
      <div className="deliver">
        <div className="features">
          {FEATURES.map((f, i) => {
            const on = i === active
            return (
              <button key={f.t} type="button" onClick={() => setActive(i)} className={'feat' + (on ? ' on' : '')} aria-pressed={on}>
                {on && <ProgressBorder progress={prog} />}
                <span className="f-n">0{i + 1}</span>
                <span className="f-t">{f.t}</span>
                <span className="f-d">{f.d}</span>
              </button>
            )
          })}
        </div>
        <figure className="phone-fig">
          <div className="phone"><div className="screen">
            {FEATURES.map((f, i) => (
              <video key={f.v} ref={el => { vids.current[i] = el }} src={f.v} poster={f.poster} muted playsInline preload={i === 0 ? 'auto' : 'metadata'}
                aria-label={f.label} style={{ opacity: i === active ? 1 : 0 }}
                onTimeUpdate={e => { if (i === active && e.currentTarget.duration) setProg(e.currentTarget.currentTime / e.currentTarget.duration) }}
                onEnded={() => { if (i === active) setActive((active + 1) % FEATURES.length) }} />
            ))}
          </div></div>
          <figcaption key={active}>{FEATURES[active].caption}</figcaption>
        </figure>
      </div>
    </div>
  )
}

function Deliver() {
  return (
    <section className="sec dark" data-chapter="Deliver">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="06" label="Deliver" />
          <Head kicker="The design we tested:">3 features, 7 key screens</Head>
          <p className="tb-body mt-24 w-700">Each feature solves one pain point. Features 1 and 2 make rewards easy to find. Feature 3 makes them easy to use. [ <a className="u" href={PROTOTYPE_URL} target="_blank" rel="noreferrer">Try the clickable prototype</a> ]</p>
        </div>
        <DeliverShowcase />
      </div>
    </section>
  )
}

/**
 * One fix: the phone panel stays pinned on the left while the text on the right scrolls past in two steps.
 * When the second step reaches the middle of the screen, the phone flips over in 3D (As-is → To-be)
 * and the panel colour changes with it; scrolling back up flips it back. Small screens: both phones side by side.
 */
function FixBlock({ kicker, title, body, stat, statLabel, statNote, before, after, alt }: {
  kicker: string; title: React.ReactNode; body: string; stat: string; statLabel: string; statNote: string; before: string; after: string; alt: string
}) {
  const step2 = useRef<HTMLDivElement>(null)
  const [toBe, setToBe] = useState(false)
  useOnScroll(() => { const el = step2.current; if (el) setToBe(el.getBoundingClientRect().top < innerHeight * 0.55) })
  const textTop = (
    <div>
      <div className="m-k">{kicker}</div>
      <h3 className="fix-title">{title}</h3>
      <p className="tb-body mt-24">{body}</p>
    </div>
  )
  const textBottom = (
    <div>
      <div className="stat-v">{stat}</div>
      <div className="stat-l strong">{statLabel}</div>
      <div className="stat-l">{statNote}</div>
    </div>
  )
  const face = (src: string, label: string, back: boolean) => (
    <img src={src} alt={`${alt} — ${label}`} loading="lazy" className="fix-face" style={{ transform: back ? 'rotateY(180deg)' : undefined }} />
  )
  return (
    <div className="fix-block">
      <div className="fix-wide">
        <div className="fix-left">
          <div className="fix-pin">
            <div className={'fix-panel' + (toBe ? ' to' : '')}>
              <div className="seg" aria-hidden="true">
                {['As-is', 'To-be'].map((l, i) => <span key={l} className={(i === 1) === toBe ? 'on' : ''}>{l}</span>)}
              </div>
              <div className="fix-card" style={{ transform: `rotateY(${toBe ? 180 : 0}deg)` }}>
                {face(before, 'as-is', false)}
                {face(after, 'to-be', true)}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="fix-step">{textTop}</div>
          <div className="fix-step" ref={step2}>{textBottom}</div>
        </div>
      </div>
      <div className="fix-narrow">
        {textTop}
        <div className="fix-pair">
          {[['As-is', before], ['To-be', after]].map(([l, src]) => (
            <figure key={l}><figcaption>{l}</figcaption><img src={src} alt={`${alt} — ${l.toLowerCase()}`} loading="lazy" /></figure>
          ))}
        </div>
        <div className="mt-40">{textBottom}</div>
      </div>
    </div>
  )
}

const pct = (x: number, y: number, w: number, h: number): React.CSSProperties => ({ left: `${(x / 929) * 100}%`, top: `${(y / 457) * 100}%`, width: `${(w / 929) * 100}%`, height: `${(h / 457) * 100}%` })

function Test() {
  const [ref, p] = useCountProgress<HTMLDivElement>()
  return (
    <section className="sec" data-chapter="Test">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="07" label="Test" />
          <Head kicker="Usability testing:">finding points was the hardest part</Head>
          <div className="assume mt-24">
            <div><div className="m-k">Our assumption</div><p className="tb-body">If Linkpoints are easier to reach, users will use Trust Bank more often.</p></div>
            <div><div className="m-k">Validated in testing</div><p className="tb-body">Easier access worked: 77% of tasks were done without help, and every user said they’d keep using it. [ <a className="u" href={SHEET_URL} target="_blank" rel="noreferrer">one shared sheet</a> ]</p></div>
          </div>
        </div>

        <div className="stats three mt-60" ref={ref}>
          <div className="stat"><div className="stat-v">{Math.round(77 * p)}%</div><div className="stat-l strong">tasks done without help</div></div>
          <div className="stat">
            <div className="stat-v">{Math.round(85 * p)}</div>
            <div className="stat-l strong">ease-of-use score (SUS)</div>
            <div className="stat-l">Out of 100 · A+ grade</div>
            <div className="sus"><i style={{ width: `${85 * p}%` }} /><b style={{ left: '68%' }} /></div>
            <div className="sus-k"><span>0</span><span style={{ left: '68%' }}>68 = average</span><span>100</span></div>
          </div>
          <div className="stat"><div className="stat-v">{Math.round(100 * p)}%</div><div className="stat-l strong">said they’d keep using it</div></div>
        </div>

        <div className="ut mt-60" data-reveal>
          <div className="ut-video">
            <video src={IMG.utVideo} poster={IMG.utPoster} autoPlay muted loop playsInline preload="metadata" aria-label="Remote usability test session on the prototype (participant masked)" />
            {/* privacy masks (kept from the original page) */}
            <div className="mask" style={{ ...pct(63, 5, 86, 22), background: '#0f0f0f' }} aria-hidden="true" />
            <div className="mask" style={{ ...pct(764, 6, 116, 26), background: '#1f1f1f' }} aria-hidden="true" />
            <div className="mask" style={{ ...pct(0, 411, 639, 43), background: '#1a1a1a' }} aria-hidden="true" />
            <div className="mask blur" style={pct(639, 264, 142, 183)} aria-hidden="true" />
            <span className="mask-label" style={{ left: `${(647 / 929) * 100}%`, top: `${(232 / 457) * 100}%` }}>Researcher</span>
          </div>
          <img src={IMG.utSheet} loading="lazy" alt="Task success by participant: T2 LinkPoints only 2 of 6 without help, T5 Rewards page 3 of 6; overall 23/30 = 77%" />
        </div>

        <div className="mt-120" data-reveal>
          <Head>What we changed after testing</Head>
          <p className="tb-body mt-24 w-700">6 users showed us 16 issues, and we made 7 fixes. The 2 below fixed the hardest tasks; the other 5 were smaller copy and layout changes. We haven’t re-tested yet.</p>
        </div>
        <FixBlock kicker="Fix 1 · Points journey" title={<>Users saw their points,<br />but not what they were for</>}
          body="The points bar now shows each reward on the way. Now 300 points has a clear goal."
          stat="2/6" statLabel="checked their points without help" statNote="2 users asked what 300 points were for."
          before={IMG.fix1Before} after={IMG.fix1After} alt="Fix 1, LinkPoints screen" />
        <FixBlock kicker="Fix 3 + 4 · Rewards hub" title={<>Rewards were there,<br />but hard to spot</>}
          body="Coupons and stamps got their own sections with See All. Trust+ moved to the top."
          stat="3/6" statLabel="needed a hint to find a reward" statNote="IT users rated ease of use 73. General users rated it 91."
          before={IMG.fix34Before} after={IMG.fix34After} alt="Fix 3 + 4, Rewards screen" />
      </div>
    </section>
  )
}

function Reflection() {
  return (
    <section className="sec dark" data-chapter="Reflection">
      <div className="wrap">
        <div data-reveal><Eyebrow n="08" label="Reflection" /></div>
        <div className="reflect mt-24">
          <div data-reveal>
            <Head>Takeaways</Head>
            <div className="take">
              <p>I learned to measure what users notice, not what the system records. 9 billion points meant little to users who never saw them.</p>
              <p>I also learned to pick a problem design can change. “Make Trust Bank their main bank” was too big, but “make rewards easy to find” was something we could test.</p>
              <p>Last, rewards cost the bank money, because unused points are money it owes. They only pay off if they keep users coming back.</p>
            </div>
          </div>
          <img data-reveal style={{ '--d': 1 } as React.CSSProperties} src={IMG.reflection} alt="Harbor presenting the Trust Bank design to her team" loading="lazy" />
        </div>
        <div className="next-steps mt-80">
          <div className="m-k light" data-reveal>Next Steps</div>
          <div className="ns-row" data-reveal><span>01</span><p>Apply the 3 remaining fixes from the test, then re-test the points journey with new users.</p></div>
          <div className="ns-row" data-reveal style={{ '--d': 1 } as React.CSSProperties}><span>02</span><div><p>After that, pilot the FairPrice link and measure two numbers that show whether rewards bring people back:</p><p className="ns-metric">FairPrice link rate · 30-day retention</p></div></div>
        </div>
      </div>
    </section>
  )
}

/* ---------- page ---------- */

export function TrustBank() {
  const [chapter, setChapter] = useState('Trust Bank')
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const lastY = useRef(0)

  useEffect(() => { scrollTo(0, 0) }, [])
  useMagnifier(pageRef)

  // reading progress, light header after the hero, and tuck the header away while scrolling down
  useOnScroll(() => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight
    if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
    setScrolled(y > 40)
    if (y < 80) setHidden(false)
    else if (y > lastY.current + 4) setHidden(true)
    else if (y < lastY.current - 4) setHidden(false)
    lastY.current = y
  })

  // current chapter name in the header
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setChapter((e.target as HTMLElement).dataset.chapter || '') }), { rootMargin: '-45% 0px -54% 0px' })
    document.querySelectorAll('[data-chapter]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  // soft block reveal: anything already on screen comes in right away, the rest as it scrolls in
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.tb [data-reveal]'))
    if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight * 0.92) e.classList.add('in') })
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })
    els.filter(e => !e.classList.contains('in')).forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  const toNext = (e: React.MouseEvent) => { e.preventDefault(); document.getElementById('next')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }) }
  const idx = CHAPTERS.indexOf(chapter)

  return (
    <div className="hb tb" ref={pageRef}>
      <style>{CSS + TB_CSS}</style>
      {/* handwriting on the Define whiteboard only */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500&family=Kalam:wght@400&display=swap" />
      <CursorTrail />

      <header className={'tb-head' + (scrolled ? ' scrolled' : '') + (hidden ? ' hidden' : '')} onFocusCapture={() => setHidden(false)}>
        <div className="wrap tb-nav">
          <div className="nav-left">
            <a className="logo" href="#top" onClick={e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }) }}>harbor</a>
            <a className="back" href="#projects">← All projects</a>
          </div>
          <div className="chapter" aria-live="polite"><span key={chapter}>{idx >= 0 ? `0${idx + 1} · ` : ''}{chapter}</span></div>
          <div className="nav-right">
            <a className="next-link" href="#next" onClick={toNext}>Next · GameCove →</a>
            <a className="btn-sm" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
        <div className="read" aria-hidden="true"><i ref={bar} /></div>
      </header>

      <main>
        <Hero />
        <Overview />
        <Process />
        <Discover />
        <Define />
        <Develop />
        <Deliver />
        <Test />
        <Reflection />

        <section className="next" id="next">
          <a className="wrap next-card" href={NEXT_URL}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">GameCove <span className="go">→</span></span>
          </a>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-top">
            <div className="brand"><div className="logo">harbor</div><a href={LINKS.email}>harborkim0328@gmail.com</a></div>
            <div className="foot-cols">
              <div className="foot-col"><div className="h">Explore</div><a href="#experience">Experience</a><a href="#projects">Projects</a><a href="#approach">About me</a></div>
              <div className="foot-col"><div className="h">Contact</div><a href={LINKS.email}>Email</a><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a><a href={LINKS.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a></div>
            </div>
          </div>
          <div className="foot-bottom"><span>© 2026 Harbor Kim. All rights reserved.</span><span>Designed in Figma by Harbor</span></div>
        </div>
        <div className="wordmark" aria-hidden="true">harbor</div>
      </footer>
    </div>
  )
}

const TB_CSS = `
.tb .mt-20 { margin-top: 20px; } .tb .mt-24 { margin-top: 24px; } .tb .mt-40 { margin-top: 40px; } .tb .mt-60 { margin-top: 60px; }
.tb .mt-80 { margin-top: 80px; } .tb .mt-100 { margin-top: 100px; } .tb .mt-120 { margin-top: 120px; } .tb .mt-160 { margin-top: 160px; }
.tb .w-700 { max-width: 700px; } .tb .w-760 { max-width: 760px; } .tb .block { display: block; width: 100%; height: auto; }
.tb .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.tb img { max-width: 100%; }
.tb .off { background: var(--off); }
.tb .sec-pad { padding: 160px 0; }
.tb .cursor-trail { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; mix-blend-mode: difference; }

/* soft block reveal (same timing as the live page) */
.tb [data-reveal] { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 1.2s cubic-bezier(.22,1,.36,1), transform 1.2s cubic-bezier(.22,1,.36,1); transition-delay: calc(var(--d, 0) * 120ms); }
.tb [data-reveal].in { opacity: 1; transform: none; }
.tb [data-reveal] img:not([data-zoom]) { transform: scale(1.015); transition: transform 1.6s cubic-bezier(.22,1,.36,1); }
.tb [data-reveal].in img:not([data-zoom]) { transform: none; }
.tb img[data-reveal] { transform: translate3d(0, 28px, 0) scale(1.015); }
.tb img[data-reveal].in { transform: none; }

/* header: transparent over the dark hero, light after scrolling, tucks away while scrolling down */
.tb-head { position: fixed; inset: 0 0 auto 0; z-index: 50; color: #fff; border-bottom: 1px solid transparent;
  transition: background-color .35s, color .35s, border-color .35s, transform .35s cubic-bezier(.22,1,.36,1); }
.tb-head.scrolled { background: rgba(245,245,242,.9); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); color: var(--ink); border-bottom-color: var(--line); }
.tb-head.hidden { transform: translateY(calc(-100% - 4px)); }
.tb-nav { height: 72px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.tb-nav .nav-left { gap: 32px; }
.tb-nav .nav-right { justify-content: flex-end; }
.tb .back, .tb .next-link { font-size: 16px; opacity: .8; transition: opacity .2s; }
.tb .back:hover, .tb .next-link:hover { opacity: 1; }
.tb .chapter { font-size: 16px; opacity: .7; min-width: 180px; text-align: center; overflow: hidden; }
.tb .chapter span { display: inline-block; animation: rise .45s var(--ease) both; }
.tb .tb-head .btn-sm { background: #fff; color: var(--ink); }
.tb .tb-head.scrolled .btn-sm { background: var(--ink); color: #fff; }
.tb .read { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; }
.tb .read i { display: block; height: 100%; background: currentColor; transform: scaleX(0); transform-origin: 0 50%; }

/* hero */
.tb-hero { background: var(--ink); color: #fff; padding: 180px 0 120px; }
.tb-logo { display: block; height: 29px; width: auto; }
.tb-h1 { margin: 40px 0 0; font-size: clamp(56px, 4.6vw, 88px); font-weight: 300; line-height: 1.1; letter-spacing: -0.03em; }
.tb-h1 .sub { display: block; color: rgba(255,255,255,.45); }
.tb-lead { margin: 32px 0 0; font-size: 20px; line-height: 1.5; color: rgba(255,255,255,.7); }
.hero-video { position: relative; margin-top: 60px; aspect-ratio: 2 / 1; background: #049ddc; overflow: hidden; }
.hero-video video { display: block; width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.hv-controls { position: absolute; left: 0; right: 0; bottom: 0; padding: 48px 20px 16px; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.45) 100%);
  opacity: 0; pointer-events: none; transition: opacity .3s; }
.hv-controls.show { opacity: 1; pointer-events: auto; }
.hv-row { display: flex; align-items: center; gap: 16px; margin-top: 12px; color: #fff; }
.tb .hv-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: none; border: 0; color: #fff; cursor: pointer; transition: background .15s; }
.tb .hv-btn:hover { background: rgba(255,255,255,.15); }
.hv-time { font-size: 16px; font-variant-numeric: tabular-nums; }
.hv-vol { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.tb-range { -webkit-appearance: none; appearance: none; display: block; height: 3px; cursor: pointer; background: linear-gradient(90deg, #fff var(--fill, 0%), rgba(255,255,255,.35) var(--fill, 0%)); }
.tb-range.wide { width: 100%; } .tb-range.vol { width: 100px; }
.tb-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 0; }
.tb-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 0; }
.tb-range::-moz-range-track { background: transparent; }
.tb-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
.tb-meta > div { padding-top: 20px; border-top: 1px solid rgba(255,255,255,.2); }
.tb-meta p { margin: 12px 0 0; font-size: 18px; line-height: 1.6; color: rgba(255,255,255,.85); }
.tb .m-k { font-size: 16px; letter-spacing: .04em; color: var(--mute); }
.tb .dark .m-k, .tb .tb-hero .m-k, .tb .m-k.light { color: rgba(255,255,255,.55); }

/* type */
.tb-h2 { margin: 20px 0 0; font-size: 56px; font-weight: 300; line-height: 1.12; letter-spacing: -0.03em; }
.tb-h2 .k { display: block; color: #8B8B88; }
.tb .dark .tb-h2 .k { color: rgba(255,255,255,.45); }
.tb-body { margin: 0; font-size: 20px; line-height: 1.6; color: #2A2A2A; }
.tb .dark .tb-body { color: rgba(255,255,255,.72); }
.tb a.u { text-decoration: underline; text-underline-offset: 4px; text-decoration-color: rgba(127,127,127,.6); }
.tb a.u:hover { text-decoration-color: currentColor; }
.tb .fig { margin: 0; }
.tb .fig img, .tb .fig .media { display: block; width: 100%; height: auto; }
.tb .fig .cover { object-fit: cover; }
.tb .fig figcaption, .tb .cap { margin-top: 16px; font-size: 16px; color: #8B8B88; text-align: center; }
.tb .zoom-fig img { cursor: zoom-in; }
.tb .two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 80px; align-items: start; }
.tb .pad-top { padding-top: 40px; } .tb .pad-top-lg { padding-top: 200px; }
.tb .media { overflow: hidden; }
.tb .media video { display: block; width: 100%; height: 100%; object-fit: cover; }

/* overview */
.tb .ov-rows { margin-top: 40px; }
.tb .ov-row { display: grid; grid-template-columns: 370px minmax(0, 1fr); gap: 40px; padding: 40px 0; border-top: 1px solid var(--line); }
.tb .ov-k { font-size: 28px; font-weight: 300; letter-spacing: -0.02em; }
.tb .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.tb .stat { padding: 0 28px; border-left: 1px solid var(--line); }
.tb .stat:first-child { padding-left: 0; border-left: 0; }
.tb .stat-v { font-size: 64px; font-weight: 300; line-height: 1.05; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.tb .stat-l { margin-top: 10px; font-size: 16px; line-height: 1.45; color: var(--mute); }
.tb .stat-l.strong { color: var(--ink); font-size: 18px; }
.tb .stats.three { padding-top: 40px; border-top: 1px solid var(--line); }

/* define · affinity board */
.tb .af-outer { position: relative; }
.tb .af-pin { position: sticky; }
.tb .af-box { position: relative; width: 100%; overflow: hidden; background: #fff; border: 1px solid var(--line); }
.tb .af-frame { position: absolute; top: 0; left: 50%; transform-origin: top center; }
.tb .af-title { position: absolute; left: 72px; top: 40px; margin: 0; font-size: 30px; line-height: 38px; }
.tb .af-board { position: absolute; overflow: hidden; border-radius: 400px; border: 5px solid #a9afb5; background: linear-gradient(90deg, #fff 0%, #eceff1 100%); box-shadow: 0 24px 50px rgba(51,38,26,.18); }
.tb .af-inner { position: absolute; inset: -5px; }
.tb .af-glare { position: absolute; top: -300px; height: 1400px; background: rgba(255,255,255,.55); transform: rotate(-24deg); transform-origin: 0 0; }
.tb .af-abs { position: absolute; }
.tb .af-group { margin: 0; font-size: 25px; line-height: 32px; white-space: pre; }
.tb .af-under { position: absolute; left: -1px; top: 68px; }
.tb .af-pattern { position: absolute; margin: 0; font-size: 40px; line-height: 50px; white-space: pre; }
.tb .af-cap { margin: 0; font-size: 24px; line-height: 25px; white-space: pre; }
.tb .af-last { margin: 0; font-size: 32px; line-height: 40px; white-space: pre; transform: rotate(-1deg); }
.tb .af-sticky { position: absolute; }
.tb .af-sticky p { position: absolute; left: 7px; right: 7px; top: 12px; margin: 0; font-size: 16px; line-height: 18px; letter-spacing: -0.01em; }
.tb .af-tape { position: absolute; left: 0; right: 0; top: 0; height: 10px; background: rgba(0,0,0,.05); }
.tb .af-dot { position: absolute; width: 13px; height: 13px; border-radius: 50%; border: 1px solid rgba(255,255,255,.9); }
.tb .af-caption { position: relative; height: 22px; margin-top: 20px; text-align: center; font-size: 16px; line-height: 22px; color: #8B8B88; }
.tb .af-caption p { position: absolute; left: 0; right: 0; margin: 0; transition: opacity .3s; }

.tb .statement { background: var(--ink); color: #fff; padding: 120px 0; text-align: center; }
.tb .st-text { margin: 24px 0 0; font-size: clamp(36px, 3.4vw, 64px); font-weight: 300; line-height: 1.2; letter-spacing: -0.03em; color: rgba(255,255,255,.45); }
.tb .st-text em { font-style: normal; color: #fff; }
.tb .hmw { display: grid; grid-template-columns: 440px minmax(0, 1fr); gap: 60px; align-items: center; }
.tb .hmw-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.tb .hmw-card { position: relative; min-height: 300px; display: flex; flex-direction: column; padding: 24px; background: #fff; border: 1px solid var(--line); box-shadow: 0 2px 6px rgba(0,0,0,.08); }
.tb .hmw-card:hover { border-color: #BDBDBA; box-shadow: 0 18px 40px rgba(0,0,0,.07); }
.tb .h-n { font-size: 16px; color: var(--mute); }
.tb .h-q { margin: 12px 0 0; font-size: 24px; line-height: 1.3; font-weight: 400; letter-spacing: -0.01em; }
.tb .h-foot { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; font-size: 16px; color: var(--mute); }
.tb .h-foot img { width: 72px; height: 72px; filter: grayscale(1) contrast(1.1); opacity: .85; }

/* develop */
.tb .ideas { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.tb .idea { display: flex; flex-direction: column; background: #fff; border: 1px solid var(--line); }
.tb .idea:hover { border-color: #BDBDBA; box-shadow: 0 18px 40px rgba(0,0,0,.07); }
.tb .idea header { display: flex; align-items: baseline; gap: 14px; padding: 28px 28px 0; }
.tb .i-n { font-size: 16px; color: var(--mute); }
.tb .idea h3 { margin: 0; font-size: 26px; font-weight: 400; letter-spacing: -0.02em; }
.tb .i-sk { display: flex; justify-content: center; gap: 16px; margin: 20px 28px 0; padding: 20px; background: var(--off); }
.tb .i-sk img { height: 280px; width: auto; max-width: calc(50% - 8px); object-fit: contain; }
.tb .idea dl { margin: 0; padding: 24px 28px 28px; }
.tb .idea dt { font-size: 16px; color: var(--mute); }
.tb .idea dt + dd { margin: 8px 0 0; font-size: 18px; line-height: 1.5; }
.tb .idea dd.pain { padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--line); font-size: 20px; }
.tb .two-img { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.tb .two-img img { width: 100%; aspect-ratio: 700 / 472; object-fit: cover; }

/* deliver: pinned showcase, progress runs around the active card */
.tb .deliver-outer { position: relative; height: 280vh; }
.tb .deliver { position: sticky; top: max(90px, calc(50vh - 400px)); display: grid; grid-template-columns: minmax(0, 620px) 360px; justify-content: center; gap: 180px; align-items: center; }
.tb .features { display: flex; flex-direction: column; gap: 20px; }
.tb .feat { position: relative; display: flex; flex-direction: column; gap: 10px; width: 100%; padding: 22px 30px; text-align: left; cursor: pointer; color: #fff;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.12); transition: background .5s, border-color .5s, box-shadow .5s; }
.tb .feat.on { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.2); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.tb .progress-border { position: absolute; top: -1px; left: -1px; overflow: visible; pointer-events: none; }
.tb .f-n { font-size: 16px; color: rgba(255,255,255,.45); }
.tb .feat.on .f-n { color: #fff; }
.tb .f-t { font-size: 24px; font-weight: 400; letter-spacing: -0.01em; color: rgba(255,255,255,.45); transition: color .5s; }
.tb .feat.on .f-t { color: #fff; }
.tb .f-d { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,.35); transition: color .5s; }
.tb .feat.on .f-d { color: rgba(255,255,255,.75); }
.tb .phone-fig { margin: 0 auto; width: 100%; max-width: 360px; }
.tb .phone { padding: 12px; background: #000; border-radius: 60px; box-shadow: 0 30px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.12); }
.tb .screen { position: relative; overflow: hidden; border-radius: 48px; background: #fff; aspect-ratio: 394 / 852; }
.tb .screen video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity .5s; }
.tb .phone-fig figcaption { margin-top: 20px; text-align: center; font-size: 16px; color: rgba(255,255,255,.55); animation: rise .45s var(--ease) both; }

/* test */
.tb .assume { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1100px; }
.tb .assume .m-k { margin-bottom: 10px; }
.tb .sus { position: relative; height: 4px; margin-top: 20px; max-width: 380px; background: var(--line); }
.tb .sus i { position: absolute; inset: 0 auto 0 0; background: var(--ink); }
.tb .sus b { position: absolute; top: -6px; width: 2px; height: 16px; background: var(--ink); }
.tb .sus-k { position: relative; height: 22px; margin-top: 8px; max-width: 380px; font-size: 16px; color: var(--mute); }
.tb .sus-k span { position: absolute; white-space: nowrap; }
.tb .sus-k span:first-child { left: 0; } .tb .sus-k span:last-child { right: 0; } .tb .sus-k span:nth-child(2) { transform: translateX(-50%); }
.tb .ut { display: grid; grid-template-columns: 929fr 369fr; gap: 24px; align-items: start; }
.tb .ut-video { position: relative; overflow: hidden; aspect-ratio: 929 / 457; background: #111; }
.tb .ut-video video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.tb .mask { position: absolute; border-radius: 6px; }
.tb .mask.blur { background: rgba(153,153,153,.15); -webkit-backdrop-filter: blur(30px); backdrop-filter: blur(30px); }
.tb .mask-label { position: absolute; font-size: 16px; line-height: 25px; color: #fff; }

/* fix: pinned phone panel that flips As-is → To-be */
.tb .fix-wide { display: grid; grid-template-columns: minmax(0, 640px) minmax(0, 1fr); gap: 100px; max-width: 1255px; }
.tb .fix-left { position: relative; }
.tb .fix-pin { position: sticky; top: calc(50vh - clamp(520px, 76vh, 680px) / 2); }
.tb .fix-panel { position: relative; display: flex; align-items: flex-end; justify-content: center; height: clamp(520px, 76vh, 680px); padding-bottom: 30px; overflow: hidden;
  background: #F0F0EC; perspective: 1600px; transition: background-color .7s; }
.tb .fix-panel.to { background: #E2E2DC; }
.tb .seg { position: absolute; left: 20px; top: 20px; z-index: 2; display: inline-flex; padding: 4px; background: rgba(255,255,255,.85); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); font-size: 16px; }
.tb .seg span { padding: 6px 16px; color: var(--mute); transition: background-color .5s, color .5s; }
.tb .seg span.on { background: var(--ink); color: #fff; }
.tb .fix-card { position: relative; height: calc(100% - 120px); aspect-ratio: 600 / 1230; transform-style: preserve-3d; transition: transform .9s cubic-bezier(.65,0,.35,1); }
.tb .fix-face { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.tb .fix-step { display: flex; flex-direction: column; justify-content: center; min-height: 100vh; }
.tb .fix-title { margin: 16px 0 0; font-size: 40px; font-weight: 300; line-height: 1.15; letter-spacing: -0.03em; }
.tb .fix-narrow { display: none; }
.tb .fix-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px; }
.tb .fix-pair figure { margin: 0; padding: 16px 12px 0; background: #F0F0EC; }
.tb .fix-pair figcaption { text-align: center; font-size: 16px; color: #333; }
.tb .fix-pair img { display: block; width: 100%; margin-top: 12px; }

/* reflection */
.tb .reflect { display: grid; grid-template-columns: minmax(0, 1fr) 460px; gap: 120px; align-items: start; }
.tb .reflect > img { width: 100%; }
.tb .take { margin-top: 32px; }
.tb .take p { margin: 0; padding: 20px 0; border-top: 1px solid rgba(255,255,255,.15); font-size: 20px; line-height: 1.6; color: rgba(255,255,255,.8); }
.tb .ns-row { display: flex; gap: 24px; padding: 24px 0; border-top: 1px solid rgba(255,255,255,.15); }
.tb .ns-row span { width: 40px; flex: none; font-size: 22px; color: rgba(255,255,255,.45); }
.tb .ns-row p { margin: 0; font-size: 24px; font-weight: 300; line-height: 1.4; color: #fff; }
.tb .ns-row .ns-metric { margin-top: 10px; font-size: 18px; font-weight: 400; color: rgba(255,255,255,.6); }
.tb .next-steps > .m-k { margin-bottom: 16px; }

/* next project */
.tb .next { background: var(--off); }
.tb .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.tb .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.tb .next-card:hover .next-name { transform: translateX(8px); }

@media (max-width: 1280px) {
  .tb .reflect, .tb .hmw, .tb .ov-row { grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .tb .deliver { gap: 60px; }
}
@media (max-width: 1023px) {
  .tb .deliver-outer { height: auto; }
  .tb .deliver { position: static; grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 900px) {
  .tb-nav { grid-template-columns: 1fr auto; } .tb .chapter, .tb .next-link, .tb .back { display: none; }
  .tb .two, .tb .tb-meta, .tb .stats, .tb .hmw-cards, .tb .ideas, .tb .two-img, .tb .ut, .tb .assume { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .tb .stat { padding: 0; border-left: 0; }
  .tb .pad-top, .tb .pad-top-lg { padding-top: 0; }
  .tb-h2 { font-size: 40px; }
}
@media (max-width: 767px) {
  .tb .fix-wide { display: none; } .tb .fix-narrow { display: block; margin-top: 60px; }
}
@media (prefers-reduced-motion: reduce) {
  .tb [data-reveal], .tb [data-reveal] img { opacity: 1 !important; transform: none !important; transition: none !important; }
  .tb .fix-card { transition: none; }
}
`
