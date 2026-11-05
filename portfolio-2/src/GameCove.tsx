import React, { useEffect, useRef, useState } from 'react'
import { CSS } from './portfolio'

// GameCove case study — same copy and section flow as the live page
// (harbor-k.github.io/landing_page/gamecove, from Figma "Backup · GameCove_v.2"), with the look moved to
// this site's tone, the same way TrustBank.tsx was: light two-tone headlines, square corners, white / off-white /
// ink bands, numbered eyebrows, no colour accents (the Figma blues become ink and grey).
// Interactions kept: soft block reveal (1.2s), header that tucks away on scroll down with the chapter name and
// reading bar, the Process accordion (hover / click opens a stage), count-up numbers, hover magnifier on the
// design-system panels, and the cursor dot trail.
// Pictures that aren't in Figma yet are grey slots with their label, like the Figma.

const L = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/'
const NEXT_URL = '#/trust-bank'
// "View vibecoding site": the Figma button has no link yet. Put the address here and the button appears in the hero.
const VIBE_URL = ''
const LINKS = {
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  linkedin: 'https://www.linkedin.com/in/harborkim/',
  instagram: 'https://instagram.com/harbor_0328',
  email: 'mailto:harborkim0328@gmail.com',
}

const IMG = {
  logo: L + 'logo.png',
  accEmpathize: L + 'acc-empathize.webp', accDefine: L + 'acc-define.webp', accIdeate: L + 'acc-ideate.webp',
  photo1: L + 'photo-1.webp', photo2: L + 'photo-2.webp',
  dsColour: L + 'ds-colour.webp', dsType: L + 'ds-type.webp', dsSpacing: L + 'ds-spacing.webp',
}

const CHAPTERS = ['Overview', 'Process', 'Empathize', 'Define', 'Ideate', 'Prototype', 'Design system', 'Final design', 'Test', 'Reflection']

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

/** counts up with p, keeping the target's decimals (85.5) */
const count = (target: number, p: number) => (target * p).toFixed((String(target).split('.')[1] || '').length)

function Eyebrow({ n, label }: { n: string; label: string }) {
  return <div className="eyebrow">({n}) {label}</div>
}

function Head({ kicker, children, className = '' }: { kicker?: string; children: React.ReactNode; className?: string }) {
  return (
    <h2 className={'gc-h2 ' + className}>
      {kicker && <span className="k">{kicker}</span>}
      {children}
    </h2>
  )
}

/** image slot from the Figma file: the picture isn't made yet, so it shows its label */
function Slot({ label, ratio }: { label: string; ratio: string }) {
  return <div className="slot" style={{ aspectRatio: ratio }} role="img" aria-label={`${label} (image coming soon)`}><span>{label}</span></div>
}

/* ---------- cursor dot trail (same as the Trust Bank page) ---------- */

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

/* ---------- hover magnifier for images marked data-zoom (same as the Trust Bank page) ---------- */

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

/* ---------- sections ---------- */

function Hero() {
  return (
    <section className="gc-hero" id="top" data-chapter="GameCove">
      <div className="wrap">
        <div data-reveal>
          <div className="gc-chip"><img src={IMG.logo} alt="GameCove" /><span className="bar" aria-hidden="true" />Product design case study</div>
          <h1 className="gc-h1">Helping first-time game creators<span className="sub">decide what to fix next</span></h1>
          <p className="gc-lead">An AI analytics dashboard that reads your game first</p>
          {VIBE_URL && <a className="btn btn-light gc-cta" href={VIBE_URL} target="_blank" rel="noreferrer">View vibecoding site <span className="go">→</span></a>}
        </div>
        <div className="gc-banner" data-reveal role="img" aria-label="Hero image coming soon: AI Mapping canvas and Overview with AI briefing (GameCove Ver.2)">
          <span>Image · Hero · AI Mapping canvas + Overview with AI briefing (GameCove Ver.2)</span>
        </div>
        <div className="gc-meta">
          <div data-reveal style={{ '--d': 0 } as React.CSSProperties}><div className="m-k">TIMELINE</div><p>9 weeks<br />August – October 2026</p></div>
          <div data-reveal style={{ '--d': 1 } as React.CSSProperties}><div className="m-k">TEAM &amp; ROLE</div><p>2 product designers<br />My part: UI design, data visualisation, design system, test plan and scoring<br />Together: AI agent design</p></div>
          <div data-reveal style={{ '--d': 2 } as React.CSSProperties}><div className="m-k">PLATFORM</div><p>Desktop web · Game analytics (B2B)<br />AI agent</p></div>
        </div>
      </div>
    </section>
  )
}

function Overview() {
  const stats = [['85.5', 'ease-of-use score (SUS, A+)'], ['2 of 3', 'hidden problems found by users'], ['3 of 3', 'used the data to form a hypothesis']]
  return (
    <section className="sec" data-chapter="Overview">
      <div className="wrap">
        <div data-reveal><Eyebrow n="01" label="Overview" /></div>
        <div className="ov-rows">
          <div className="ov-row" data-reveal>
            <div className="ov-k">The problem</div>
            <p className="gc-body">AI made it easy to build a game. Fixing it after launch is still hard. The Roblox dashboard shows how many players left, but not where or why. Creators can set up their own tracking, but beginners don’t know what to track. So they guess.</p>
          </div>
          <div className="ov-row" data-reveal>
            <div className="ov-k">Solution</div>
            <p className="gc-body">GameCove reads the game first and draws its structure as a map. The creator checks the map, picks a goal, and GameCove suggests what to track. Then the dashboard opens with the 2–3 changes worth a look, and an AI agent answers follow-up questions.</p>
          </div>
          <div className="ov-row" data-reveal>
            <div className="ov-k">Impact</div>
            <div className="stats">
              {stats.map(([v, l]) => <div className="stat" key={l}><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type Stage = { stage: string; no: string; title: string; items: string[]; img?: string; ratio: string; slot?: string; alt?: string }
const STAGES: Stage[] = [
  { stage: 'Empathize', no: '01', title: 'What do creators and players need?', items: ['27 creator posts', '47 player reviews + 39 feedback posts', 'Research papers & existing tools', 'Creator interviews'], img: IMG.accEmpathize, ratio: '420 / 217', alt: 'Creator user journey map' },
  { stage: 'Define', no: '02', title: 'One problem + 3 questions', items: ['Affinity map', 'Thematic analysis', 'Problem statement & HMW', '3 design questions'], img: IMG.accDefine, ratio: '420 / 217', alt: 'Define board: the problem to solve first and three design questions' },
  { stage: 'Ideate', no: '03', title: '6 rules + first ideas', items: ['6 design principles', 'Low-fi sketches & wireflow'], img: IMG.accIdeate, ratio: '420 / 281', alt: 'Hand sketch of genre- and game-specific metric groups' },
  { stage: 'Prototype', no: '04', title: 'From sketch to coded prototype', items: ['Mid-fi → Hi-fi', 'Dark / light design system', 'Vibe-coded prototype'], ratio: '420 / 217', slot: 'Image · GameCove Ver.2 · hi-fi screens' },
  { stage: 'Test', no: '05', title: 'Usability test + fixes', items: ['Sample game with 3 hidden problems', '5 test sessions, SUS + SEQ', 'Fix list'], ratio: '420 / 217', slot: 'Image · UT session capture (masked)' },
]

/** Figma "Process accordion": hovering (or clicking / focusing) a stage opens it; the others fold */
function Accordion() {
  const [active, setActive] = useState(0)
  const visual = (s: Stage) => s.img
    ? <img src={s.img} alt={s.alt ?? ''} loading="lazy" style={{ aspectRatio: s.ratio }} />
    : <Slot label={s.slot ?? ''} ratio={s.ratio} />
  return (
    <>
      <div className="acc" data-reveal>
        {STAGES.map((s, i) => {
          const on = i === active
          return (
            <button key={s.stage} type="button" className={'acc-card' + (on ? ' on' : '')} aria-expanded={on}
              onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
              <span className="acc-n">{s.no}</span>
              <span className="acc-stage">{s.stage}</span>
              <span className="acc-title">{s.title}</span>
              <span className="acc-body" aria-hidden={!on}>
                <ul>{s.items.map(t => <li key={t}>{t}</li>)}</ul>
                {visual(s)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="acc-narrow">
        {STAGES.map(s => (
          <div className="acc-card on" key={s.stage}>
            <span className="acc-n">{s.no}</span><span className="acc-stage">{s.stage}</span><span className="acc-title">{s.title}</span>
            <span className="acc-body"><ul>{s.items.map(t => <li key={t}>{t}</li>)}</ul>{visual(s)}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Process() {
  return (
    <section className="sec off" data-chapter="Process">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="02" label="Process" />
          <Head kicker="5 stages,">2 turning points</Head>
        </div>
        <div className="mt-60"><Accordion /></div>
        <div className="turns mt-40" data-reveal>
          <p><span>↺</span>We narrowed the idea from “explain player behaviour” to “give creators the information they need”</p>
          <p><span>↺</span>After teacher feedback, we moved from solo users (B2C) to teams sharing one game (B2B)</p>
        </div>
      </div>
    </section>
  )
}

function Empathize() {
  const chain = ['Goal', 'Question', 'Behaviour to watch', 'Data to log']
  return (
    <section className="sec" data-chapter="Empathize">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="03" label="Empathize" />
          <Head kicker="Making a game got easy.">Fixing it didn’t.</Head>
          <p className="gc-body mt-24 w-760">Roblox Studio and AI tools let beginners launch a game in a few months. But the basic dashboard only shows results, like playtime and drop-off rate. It doesn’t show which stage or obstacle makes players quit.</p>
        </div>
        <div className="two mt-80">
          <div data-reveal>
            <Slot label="Image · Creator journey (FigJam)" ratio="700 / 380" />
            <h3 className="gc-h3 mt-24">What creators wrote</h3>
            <div className="m-k mt-8">27 posts from Roblox forums</div>
            <p className="gc-body mt-20">Creators knew something was wrong, but not where. They asked the community, changed many things at once, and lost track of what worked.</p>
          </div>
          <div data-reveal style={{ '--d': 1 } as React.CSSProperties}>
            <Slot label="Image · Player review analysis (FigJam)" ratio="700 / 380" />
            <h3 className="gc-h3 mt-24">What players wrote</h3>
            <div className="m-k mt-8">47 reviews + 39 requested feedback posts</div>
            <p className="gc-body mt-20">Players decide in the first few minutes. If something feels off, they leave before seeing the rest. Reviews rarely show what happened in between, so we needed behaviour data.</p>
          </div>
        </div>

        <div className="mt-160" data-reveal>
          <Head kicker="Creators want a fast fix,">not a perfect answer</Head>
          <p className="gc-body mt-24 w-760">We interviewed 3 creators, then held a second interview with a professional game developer. Creators fixed things as soon as a cause looked likely, then checked the numbers. The expert linked four things from the start. Beginners had the goal, but couldn’t turn it into a question.</p>
        </div>
        <div className="mt-60" data-reveal>
          <div className="chain">
            {chain.map((c, i) => (
              <React.Fragment key={c}>
                {i > 0 && <span className="arr" aria-hidden="true">→</span>}
                <span className={'link-step' + (i === 0 ? ' first' : '')}>{c}</span>
              </React.Fragment>
            ))}
          </div>
          <p className="cap-l mt-20">Beginners stop after “Goal”. Experts connect all four.</p>
        </div>
        <div className="mt-60" data-reveal>
          <table className="gc-table w-900">
            <thead><tr><th>Who</th><th>Experience</th><th>Where</th></tr></thead>
            <tbody>
              <tr><td>Student creator</td><td>Game high school, teen</td><td>Korea</td></tr>
              <tr><td>Game developer</td><td>Works at a game company, 20s</td><td>Korea</td></tr>
              <tr><td>Hobby creator</td><td>Makes games for fun, teen</td><td>Belgium</td></tr>
            </tbody>
          </table>
          <p className="cap-l mt-20">Minors joined with guardian consent. Names and faces are not shown.</p>
        </div>
        <div className="mt-60" data-reveal><Slot label="Image · Interview affinity map + thematic analysis (FigJam)" ratio="1440 / 560" /></div>

        <div className="scenario mt-120" data-reveal>
          <div>
            <div className="m-k">PROBLEM SCENARIO</div>
            <div className="sc-name">Meet Sunghyun</div>
          </div>
          <div>
            <p className="gc-body">Sunghyun built a ball-rolling stage game in 3 months with help from AI. Two weeks after launch, he wants to add Stage 5. His dashboard shows playtime and drop-off rate, but not which obstacle is too hard or too easy.</p>
            <p className="gc-body mt-20">The data keeps piling up. It just doesn’t help him decide.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const QUESTIONS = [
  ['A', 'How do we collect data?', 'Beginners shouldn’t have to write tracking code.', 'AI Mapping + goal-based tracking'],
  ['B', 'How do we show it?', 'Once tracked, there’s too much to look at.', 'Goal-based analysis board'],
  ['C', 'How do we help them read it?', '“Stage 4 clear rate 57%”. Is that a problem?', 'AI briefing + AI agent'],
]

function Define() {
  return (
    <>
      <section className="sec off" data-chapter="Define">
        <div className="wrap">
          <div data-reveal>
            <Eyebrow n="04" label="Define" />
            <Head kicker="The problem wasn’t reading data.">It was knowing what to check.</Head>
            <p className="gc-body mt-24 w-760">Roblox already lets creators track each stage with funnels and custom events. Beginners didn’t use them. Not because the tool was missing, but because they didn’t know what to track.</p>
          </div>
        </div>
      </section>
      <section className="statement" data-chapter="Define">
        <div className="wrap" data-reveal>
          <div className="eyebrow">How might we</div>
          <p className="st-text">Help creators who are new to data <em>find evidence fast, and make better update decisions?</em></p>
        </div>
      </section>
      <section className="sec off" data-chapter="Define">
        <div className="wrap">
          <h3 className="gc-h3" data-reveal>We picked one problem to solve first</h3>
          <div className="pick mt-24">
            <div className="pick-card ink" data-reveal>
              <div className="m-k">SOLVE NOW</div>
              <div className="pc-t">No behaviour data</div>
              <p>Creators want to fix fast and check the result. Behaviour data feeds that loop directly.</p>
            </div>
            <div className="pick-card" data-reveal style={{ '--d': 1 } as React.CSSProperties}>
              <div className="m-k">LATER</div>
              <div className="pc-t">No reasons from players</div>
              <p>Important, but it fills gaps that behaviour data can’t explain. We kept it as a next step.</p>
            </div>
          </div>
          <h3 className="gc-h3 mt-120" data-reveal>3 questions to design for</h3>
          <div className="qs mt-24">
            {QUESTIONS.map(([k, t, b, a], i) => (
              <div className="q-card" key={k} data-reveal style={{ '--d': i } as React.CSSProperties}>
                <div className="q-k">{k}</div>
                <div className="pc-t">{t}</div>
                <p>{b}</p>
                <div className="q-a">→ {a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const RULES = [
  ['01', 'Start from a question', 'Show pages built around what the creator wants to check, plus a page of basic metrics.'],
  ['02', 'Suggest, don’t lock in', 'AI builds a bundle of charts. The creator can pick, mix and edit it.'],
  ['03', 'Go step by step', 'Overview → problem signal → comparison → player evidence.'],
  ['04', 'Keep ideas next to evidence', 'Link each hypothesis to the data for and against it. AI offers other explanations too.'],
  ['05', 'Explain inside the chart', 'Short titles and notes on the chart, not long AI reports.'],
  ['06', 'The creator makes the call', 'AI starts and widens the analysis. The direction and final decision stay with the creator.'],
]

function Ideate() {
  return (
    <section className="sec" data-chapter="Ideate">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="05" label="Ideate" />
          <Head kicker="6 rules from research:">AI goes first, the creator decides</Head>
          <p className="gc-body mt-24 w-760">Research on sensemaking showed that beginners need a starting point, not more charts. So the AI should act as a guide, not a judge. Its suggestions must be easy to check and change.</p>
        </div>
        <div className="rules mt-80">
          {RULES.map(([n, t, b], i) => (
            <div className="rule" key={n} data-reveal style={{ '--d': i % 2 } as React.CSSProperties}>
              <span className="r-n">{n}</span>
              <div><div className="pc-t">{t}</div><p>{b}</p></div>
            </div>
          ))}
        </div>
        <div className="two-img mt-80" data-reveal>
          <Slot label="Image · Low-fi wireflow" ratio="700 / 470" />
          <Slot label="Image · Low-fi sketches" ratio="700 / 470" />
        </div>
        <div className="two-img mt-24" data-reveal>
          <img src={IMG.photo1} alt="Harbor reviewing screens on a laptop during the ideation session" loading="lazy" />
          <img src={IMG.photo2} alt="Harbor explaining a design idea to her teammate" loading="lazy" />
        </div>
      </div>
    </section>
  )
}

function Prototype() {
  const steps = ['Low-fi sketch', 'Wireflow (teacher review)', 'Mid-fi', 'Metrics locked', 'Page hierarchy', 'Hi-fi', 'Vibe-coded prototype']
  return (
    <section className="sec off" data-chapter="Prototype">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="06" label="Prototype" />
          <Head kicker="From sketch">to a coded prototype</Head>
        </div>
        <div className="chain mt-60" data-reveal>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span className="arr" aria-hidden="true">→</span>}
              <span className={'tag' + (i >= 5 ? ' ink' : '')}>{s}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="two-img mt-60" data-reveal>
          <Slot label="Image · Mid-fi → Hi-fi screens" ratio="700 / 470" />
          <Slot label="Image · Vibe-coded prototype (live)" ratio="700 / 470" />
        </div>
      </div>
    </section>
  )
}

function DesignSystem() {
  const [ref, p] = useCountProgress<HTMLDivElement>()
  const stats: [number, string][] = [[19, 'core colours'], [31, 'semantic tokens'], [24, 'spacing, radius & size tokens'], [6, 'text styles']]
  return (
    <section className="sec dark" data-chapter="Design system">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="07" label="Prototype · Design system" />
          <Head kicker="One token system">for a dark data dashboard</Head>
          <p className="gc-body mt-24 w-760">I built the GameCove design system in 3 layers: raw colours, tokens named by their job, and components. Screens use the tokens, not raw colours, so a light mode can be added by mapping new values.</p>
        </div>
        <div className="stats four mt-60" ref={ref}>
          {stats.map(([n, l]) => <div className="stat" key={l}><div className="stat-v">{Math.round(n * p)}</div><div className="stat-l">{l}</div></div>)}
        </div>
        <img className="ds-img mt-60" data-reveal data-zoom="true" src={IMG.dsColour} loading="lazy" alt="Colour: 9 core colours (neutral, sand, blue, coral) and how they map to semantic tokens like color/bg/canvas and chart/series/exit" />
        <div className="two-img mt-24" data-reveal>
          <img className="ds-img" data-zoom="true" src={IMG.dsType} loading="lazy" alt="Typography in Lato: Display/Page Bold 40, Display/Metric Bold 28, Title/Card 20, Body 16, Label 14, Caption 12" />
          <img className="ds-img" data-zoom="true" src={IMG.dsSpacing} loading="lazy" alt="Spacing tokens from 4 to 64 px and radius tokens none, sm 4, md 8, lg 16, full" />
        </div>
        <div className="comp mt-24" data-reveal>
          <div className="pc-t">Components</div>
          <p className="gc-body mt-20 w-900">Navigation, top bars, KPI cards, retention and stage-progression chart cards, the AI agent panel, modals and tooltips. Every chart card is built from the same tokens, so new boards stay consistent.</p>
          <div className="two-img mt-40">
            <Slot label="Image · Components · nav + top bar + KPI row" ratio="642 / 347" />
            <Slot label="Image · Components · chart cards + AI agent panel" ratio="642 / 347" />
          </div>
        </div>
        <div className="decisions mt-60" data-reveal>
          <div className="m-k">Design decisions from feedback</div>
          <div className="ns-row"><span>01</span><p>Drop-off had to stand out, so exits get the only warm colour (coral).</p></div>
          <div className="ns-row"><span>02</span><p>AI should feel distinct, so AI features use the light-blue accent and a spark icon.</p></div>
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  { no: '01', title: 'AI Mapping', body: 'AI reads the game scripts and draws Lobby → Stage 1–4 as a map. The creator reviews, edits and confirms it.', solves: 'Beginners can’t turn what they built into questions. And AI can’t suggest anything useful without knowing the game.', slot: 'Image · AI Mapping · node map + structure detail panel' },
  { no: '02', title: 'Goal-based setup', body: 'The creator picks a goal, like “Where do players get stuck?”. GameCove shows what it can track now and what needs extra setup.', solves: 'Creators don’t know what to track.', slot: 'Image · Analysis goal → Tracking → Logging' },
  { no: '03', title: 'AI briefing + AI agent', body: 'The dashboard opens with the 2–3 biggest changes and suggested questions. Creators ask follow-ups in plain words.', solves: 'Creators don’t know where to start looking.', slot: 'Image · Overview with AI briefing + AI agent panel' },
]

function FinalDesign() {
  return (
    <section className="sec" data-chapter="Final design">
      <div className="wrap">
        <div data-reveal>
          <Eyebrow n="08" label="Prototype · Final design" />
          <Head kicker="The final design:">3 features</Head>
          <p className="gc-body mt-24 w-760">Feature 1 is what makes GameCove different from other dashboards. Features 2 and 3 build on the map it creates.</p>
        </div>
        {FEATURES.map((f, i) => (
          <div className={'feat-row' + (i % 2 ? ' flip' : '')} key={f.no} data-reveal>
            <div className="feat-text">
              <span className="r-n">{f.no}</span>
              <h3 className="fx-title">{f.title}</h3>
              <p className="gc-body mt-20">{f.body}</p>
              <div className="solves"><div className="m-k">SOLVES</div><p>{f.solves}</p></div>
            </div>
            <Slot label={f.slot} ratio="920 / 560" />
          </div>
        ))}
      </div>
    </section>
  )
}

function Test() {
  const [ref, p] = useCountProgress<HTMLDivElement>()
  const slowed = [
    ['01', 'Mapping', 'Users understood the map, but not why they were making it. Even the expert thought he was designing a new game.'],
    ['02', 'AI setup', 'Users couldn’t check what the AI had set up, so they felt unsure about it.'],
    ['03', 'AI agent', 'One user never noticed the AI agent.'],
    ['04', 'Charts', 'Striped charts tired some users’ eyes. Numbers only showed on hover.'],
  ]
  const fixes = [
    ['Mapping', 'Starts with no reason given', 'Explains the purpose first: “check your game’s structure so the analysis fits”'],
    ['AI setup', 'Approval step is easy to miss', 'A clear approval step, plus a screen that shows what was applied'],
    ['AI agent', 'One button in the top bar', '“Ask AI” next to each chart'],
    ['Charts', 'Striped bars, hover to see numbers', 'Standard charts by default, key numbers always shown, benchmarks from similar games'],
  ]
  return (
    <section className="sec off" data-chapter="Test">
      <div className="wrap">
        <div className="test-top">
          <div data-reveal>
            <Eyebrow n="09" label="Test" />
            <Head kicker="Usability test:">the flow worked, the start didn’t</Head>
            <p className="gc-body mt-24 w-760 w-760">5 remote sessions with think-aloud. 3 tasks: check the map, pick a goal, then explore the data and decide what to fix. We didn’t tell anyone to use the AI agent. We wanted to see if they would find it.</p>
          </div>
          <div className="key" ref={ref} data-reveal>
            <div className="stat-v">{count(85.5, p)}</div>
            <div className="sus"><i style={{ width: `${85.5 * p}%` }} /><b style={{ left: '90%' }} /></div>
            <div className="stat-l strong mt-20">average SUS score (A+). Our goal was 90.</div>
          </div>
        </div>

        <div className="mt-120" data-reveal>
          <h3 className="gc-h3">We hid 3 problems in the sample data</h3>
          <table className="gc-table mt-24">
            <thead><tr><th>Hidden problem</th><th>Found?</th><th>Who found it</th></tr></thead>
            <tbody>
              <tr><td>A · Stage 4 is too hard</td><td>Found</td><td>1 participant (the expert), via the AI briefing</td></tr>
              <tr><td>B · New players leave early</td><td>Found</td><td>2 participants, from the Lobby → Stage 1 drop</td></tr>
              <tr><td>C · Players quit after finishing</td><td className="miss">Not found</td><td>No one</td></tr>
            </tbody>
          </table>
          <p className="gc-body mt-40 w-760">Finding problems we planned is stronger proof than “users found a problem”. 3 of 3 core participants used data to form a hypothesis.</p>
        </div>
        <div className="mt-60" data-reveal><Slot label="Image · UT session capture (masked) + task / SEQ table" ratio="1440 / 560" /></div>

        <div className="mt-120" data-reveal>
          <h3 className="gc-h3">What slowed users down</h3>
          <div className="slow mt-24">
            {slowed.map(([n, t, b]) => <div className="slow-row" key={n}><span className="r-n">{n}</span><span className="sl-t">{t}</span><p>{b}</p></div>)}
          </div>
        </div>

        <div className="mt-120" data-reveal>
          <h3 className="gc-h3">What we’re fixing</h3>
          <table className="gc-table fix-table mt-24">
            <thead><tr><th /><th>Before</th><th>After</th></tr></thead>
            <tbody>{fixes.map(([t, b, a]) => <tr key={t}><td className="sl-t">{t}</td><td className="was">{b}</td><td>{a}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="two-img mt-60" data-reveal>
          <Slot label="Image · Before · Ver.2 screen" ratio="700 / 470" />
          <Slot label="Image · After · revised screen" ratio="700 / 470" />
        </div>
        <div className="limits mt-60" data-reveal>
          <div className="m-k">LIMITS</div>
          <p className="gc-body mt-8">Only 3 people were in the core analysis, and most participants were teens. That doesn’t match our target of small studios. The sample game was simple, and logging settings didn’t flow into the dashboard. These results show a direction, not proof.</p>
        </div>
      </div>
    </section>
  )
}

function Reflection() {
  return (
    <section className="sec dark" data-chapter="Reflection">
      <div className="wrap">
        <div data-reveal><Eyebrow n="10" label="Reflection" /></div>
        <div className="mt-24 w-1000" data-reveal>
          <Head>Takeaways</Head>
          <div className="take">
            <p>Users expect AI to give the answer. My next challenge is helping them reason for themselves, not just accept what AI says.</p>
            <p>Score “doing” and “understanding” separately. A user can press confirm without knowing why. That is how we found the mapping problem.</p>
            <p>Handoff goes both ways. As a receiver, I want to see the process as it happens. As a giver, I should explain every step.</p>
          </div>
        </div>
        <div className="next-steps mt-80">
          <div className="m-k light" data-reveal>Next Steps</div>
          <div className="ns-row" data-reveal><span>01</span><p>Test the fixes with one more user on a real desktop screen, and compare before and after.</p></div>
          <div className="ns-row" data-reveal style={{ '--d': 1 } as React.CSSProperties}><span>02</span><p>Test with adult creators from small studios.</p></div>
          <div className="ns-row" data-reveal style={{ '--d': 2 } as React.CSSProperties}><span>03</span><p>After launch, track setup completion, AI agent use and weekly return visits.</p></div>
        </div>
      </div>
    </section>
  )
}

/* ---------- page ---------- */

export function GameCove() {
  const [chapter, setChapter] = useState('GameCove')
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
    document.querySelectorAll('.gc [data-chapter]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  // soft block reveal: anything already on screen comes in right away, the rest as it scrolls in
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.gc [data-reveal]'))
    if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight * 0.92) e.classList.add('in') })
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })
    els.filter(e => !e.classList.contains('in')).forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  const toNext = (e: React.MouseEvent) => { e.preventDefault(); document.getElementById('next')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }) }
  const idx = CHAPTERS.indexOf(chapter)

  return (
    <div className="hb gc" ref={pageRef}>
      <style>{CSS + GC_CSS}</style>
      <CursorTrail />

      <header className={'gc-head' + (scrolled ? ' scrolled' : '') + (hidden ? ' hidden' : '')} onFocusCapture={() => setHidden(false)}>
        <div className="wrap gc-nav">
          <div className="nav-left">
            <a className="logo" href="#top" onClick={e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }) }}>harbor</a>
            <a className="back" href="#projects">← All projects</a>
          </div>
          <div className="chapter" aria-live="polite"><span key={chapter}>{idx >= 0 ? `${String(idx + 1).padStart(2, '0')} · ` : ''}{chapter}</span></div>
          <div className="nav-right">
            <a className="next-link" href="#next" onClick={toNext}>Next · Trust Bank →</a>
            <a className="btn-sm" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
          </div>
        </div>
        <div className="read" aria-hidden="true"><i ref={bar} /></div>
      </header>

      <main>
        <Hero />
        <Overview />
        <Process />
        <Empathize />
        <Define />
        <Ideate />
        <Prototype />
        <DesignSystem />
        <FinalDesign />
        <Test />
        <Reflection />

        <section className="next" id="next">
          <a className="wrap next-card" href={NEXT_URL}>
            <span className="eyebrow">Next case study</span>
            <span className="next-name">Trust Bank <span className="go">→</span></span>
          </a>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-top">
            <div className="brand"><div className="logo">harbor</div><a href={LINKS.email}>harborkim0328@gmail.com</a></div>
            <div className="foot-cols">
              <div className="foot-col"><div className="h">Explore</div><a href="#projects">Projects</a><a href="#skills">About me</a></div>
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

const GC_CSS = `
.gc .mt-8 { margin-top: 8px; } .gc .mt-20 { margin-top: 20px; } .gc .mt-24 { margin-top: 24px; } .gc .mt-40 { margin-top: 40px; } .gc .mt-60 { margin-top: 60px; }
.gc .mt-80 { margin-top: 80px; } .gc .mt-120 { margin-top: 120px; } .gc .mt-160 { margin-top: 160px; }
.gc .w-760 { max-width: 760px; } .gc .w-900 { max-width: 900px; } .gc .w-1000 { max-width: 1000px; }
.gc img { max-width: 100%; }
.gc .off { background: var(--off); }
.gc .cursor-trail { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; mix-blend-mode: difference; }

/* soft block reveal (same timing as the Trust Bank page) */
.gc [data-reveal] { opacity: 0; transform: translate3d(0, 28px, 0); transition: opacity 1.2s cubic-bezier(.22,1,.36,1), transform 1.2s cubic-bezier(.22,1,.36,1); transition-delay: calc(var(--d, 0) * 120ms); }
.gc [data-reveal].in { opacity: 1; transform: none; }
.gc [data-reveal] img:not([data-zoom]) { transform: scale(1.015); transition: transform 1.6s cubic-bezier(.22,1,.36,1); }
.gc [data-reveal].in img:not([data-zoom]) { transform: none; }
.gc img[data-reveal] { transform: translate3d(0, 28px, 0); }
.gc img[data-reveal].in { transform: none; }

/* header: transparent over the dark hero, light after scrolling, tucks away while scrolling down */
.gc-head { position: fixed; inset: 0 0 auto 0; z-index: 50; color: #fff; border-bottom: 1px solid transparent;
  transition: background-color .35s, color .35s, border-color .35s, transform .35s cubic-bezier(.22,1,.36,1); }
.gc-head.scrolled { background: rgba(245,245,242,.9); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); color: var(--ink); border-bottom-color: var(--line); }
.gc-head.hidden { transform: translateY(calc(-100% - 4px)); }
.gc-nav { height: 72px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
.gc-nav .nav-left { gap: 32px; }
.gc-nav .nav-right { justify-content: flex-end; }
.gc .back, .gc .next-link { font-size: 16px; opacity: .8; transition: opacity .2s; }
.gc .back:hover, .gc .next-link:hover { opacity: 1; }
.gc .chapter { font-size: 16px; opacity: .7; min-width: 180px; text-align: center; overflow: hidden; }
.gc .chapter span { display: inline-block; animation: rise .45s var(--ease) both; }
.gc .gc-head .btn-sm { background: #fff; color: var(--ink); }
.gc .gc-head.scrolled .btn-sm { background: var(--ink); color: #fff; }
.gc .read { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; }
.gc .read i { display: block; height: 100%; background: currentColor; transform: scaleX(0); transform-origin: 0 50%; }

/* hero */
.gc-hero { background: var(--ink); color: #fff; padding: 180px 0 120px; }
.gc-chip { display: inline-flex; align-items: center; gap: 14px; padding: 8px 16px; border: 1px solid rgba(255,255,255,.18); font-size: 16px; color: rgba(255,255,255,.8); }
.gc-chip img { display: block; height: 24px; width: auto; }
.gc-chip .bar { width: 1px; height: 16px; background: rgba(255,255,255,.25); }
.gc-h1 { margin: 40px 0 0; font-size: clamp(56px, 4.6vw, 88px); font-weight: 300; line-height: 1.1; letter-spacing: -0.03em; }
.gc-h1 .sub { display: block; color: rgba(255,255,255,.45); }
.gc-lead { margin: 32px 0 0; font-size: 20px; line-height: 1.5; color: rgba(255,255,255,.7); }
.gc .gc-cta { display: inline-block; margin-top: 40px; padding: 14px 22px; }
.gc-banner { position: relative; margin-top: 60px; aspect-ratio: 2 / 1; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center;
  background: #161616; border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.5); font-size: 16px; }
.gc-banner::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 30%; background: linear-gradient(180deg, rgba(15,15,15,0), rgba(15,15,15,.85)); }
.gc-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
.gc-meta > div { padding-top: 20px; border-top: 1px solid rgba(255,255,255,.2); }
.gc-meta p { margin: 12px 0 0; font-size: 18px; line-height: 1.6; color: rgba(255,255,255,.85); }
.gc .m-k { font-size: 16px; letter-spacing: .04em; color: var(--mute); }
.gc .dark .m-k, .gc .gc-hero .m-k, .gc .m-k.light, .gc .pick-card.ink .m-k { color: rgba(255,255,255,.55); }

/* type */
.gc-h2 { margin: 20px 0 0; font-size: 56px; font-weight: 300; line-height: 1.12; letter-spacing: -0.03em; }
.gc-h2 .k { display: block; color: #8B8B88; }
.gc .dark .gc-h2 .k { color: rgba(255,255,255,.45); }
.gc-h3 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: -0.02em; }
.gc-body { margin: 0; font-size: 20px; line-height: 1.6; color: #2A2A2A; }
.gc .dark .gc-body { color: rgba(255,255,255,.72); }
.gc .cap-l { margin-bottom: 0; font-size: 16px; color: #8B8B88; }
.gc .pc-t { font-size: 24px; font-weight: 400; letter-spacing: -0.01em; line-height: 1.3; }
.gc .r-n { font-size: 16px; color: var(--mute); font-variant-numeric: tabular-nums; }
.gc .two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 80px; align-items: start; }
.gc .two-img { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.gc .two-img > img:not(.ds-img) { width: 100%; aspect-ratio: 700 / 467; object-fit: cover; }
.gc .slot { display: flex; align-items: center; justify-content: center; width: 100%; padding: 24px; text-align: center; background: var(--ph); color: var(--mute); font-size: 16px; }
.gc .dark .slot { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.5); }
.gc .tag { background: #fff; }
.gc .tag.ink { background: var(--ink); border-color: var(--ink); color: #fff; }

/* overview + stats */
.gc .ov-rows { margin-top: 40px; }
.gc .ov-row { display: grid; grid-template-columns: 370px minmax(0, 1fr); gap: 40px; padding: 40px 0; border-top: 1px solid var(--line); }
.gc .ov-k { font-size: 28px; font-weight: 300; letter-spacing: -0.02em; }
.gc .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.gc .stats.four { grid-template-columns: repeat(4, minmax(0, 1fr)); padding-top: 40px; border-top: 1px solid rgba(255,255,255,.15); }
.gc .stat { padding: 0 28px; border-left: 1px solid var(--line); }
.gc .dark .stat { border-left-color: rgba(255,255,255,.15); }
.gc .stat:first-child { padding-left: 0; border-left: 0; }
.gc .stat-v { font-size: 64px; font-weight: 300; line-height: 1.05; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.gc .stat-l { margin-top: 10px; font-size: 16px; line-height: 1.45; color: var(--mute); }
.gc .dark .stat-l { color: rgba(255,255,255,.55); }
.gc .stat-l.strong { color: var(--ink); font-size: 18px; }

/* process accordion: hovering a stage opens it, the others fold (0.35s, like the Figma prototype) */
.gc .acc { display: flex; gap: 16px; height: 540px; }
.gc .acc-card { position: relative; flex: 220 1 0; min-width: 0; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; padding: 28px; text-align: left; cursor: pointer;
  background: #EDEDEA; border: 1px solid var(--line); transition: flex .45s cubic-bezier(.22,1,.36,1), background-color .35s, box-shadow .35s; }
.gc .acc-card.on { flex-grow: 480; background: #fff; box-shadow: 0 18px 40px rgba(0,0,0,.07); }
.gc .acc-card:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.gc .acc-n { font-size: 16px; color: var(--mute); }
.gc .acc-stage { margin-top: 10px; font-size: 28px; font-weight: 300; letter-spacing: -0.02em; }
.gc .acc-title { margin-top: 12px; width: 100%; max-width: 160px; font-size: 18px; line-height: 1.4; color: var(--mute); transition: max-width .45s cubic-bezier(.22,1,.36,1), color .35s; }
.gc .acc-card.on .acc-title { max-width: 420px; color: var(--ink); }
.gc .acc-body { position: absolute; left: 28px; top: 160px; width: 420px; max-width: calc(100% - 56px); opacity: 0; transition: opacity .12s; pointer-events: none; }
.gc .acc-card.on .acc-body { opacity: 1; transition: opacity .3s ease .18s; pointer-events: auto; }
.gc .acc-body ul { margin: 0; padding: 0; list-style: none; }
.gc .acc-body li { padding: 8px 0; border-top: 1px solid var(--line); font-size: 16px; }
.gc .acc-body img, .gc .acc-body .slot { display: block; width: 100%; margin-top: 16px; object-fit: cover; object-position: top left; }
.gc .acc-narrow { display: none; }
.gc .turns p { display: flex; gap: 12px; margin: 0; padding: 14px 0; border-top: 1px solid var(--line); font-size: 18px; color: #2A2A2A; }
.gc .turns span { color: var(--mute); }

/* empathize */
.gc .chain { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.gc .chain .arr { color: var(--mute); font-size: 20px; }
.gc .link-step { padding: 14px 22px; background: var(--ink); color: #fff; font-size: 18px; }
.gc .link-step.first { background: var(--off); color: var(--ink); border: 1px solid var(--line); }
.gc .gc-table { width: 100%; border-collapse: collapse; }
.gc .gc-table th { padding: 14px 20px 14px 0; text-align: left; font-size: 16px; font-weight: 400; color: var(--mute); border-bottom: 1px solid var(--line); }
.gc .gc-table td { padding: 18px 20px 18px 0; font-size: 18px; line-height: 1.5; border-bottom: 1px solid var(--line); vertical-align: top; }
.gc .gc-table .miss { color: var(--mute); }
.gc .gc-table .was { color: var(--mute); }
.gc .fix-table th:first-child, .gc .fix-table td:first-child { width: 220px; }
.gc .sl-t { font-weight: 500; }
.gc .scenario { display: grid; grid-template-columns: 370px minmax(0, 1fr); gap: 40px; padding: 60px; background: var(--off); }
.gc .sc-name { margin-top: 12px; font-size: 40px; font-weight: 300; letter-spacing: -0.03em; }

/* define */
.gc .statement { background: var(--ink); color: #fff; padding: 120px 0; text-align: center; }
.gc .st-text { margin: 24px auto 0; max-width: 1100px; font-size: clamp(36px, 3.4vw, 64px); font-weight: 300; line-height: 1.2; letter-spacing: -0.03em; color: rgba(255,255,255,.45); }
.gc .st-text em { font-style: normal; color: #fff; }
.gc .pick { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.gc .pick-card, .gc .q-card { display: flex; flex-direction: column; gap: 12px; padding: 32px; background: #fff; border: 1px solid var(--line); transition: border-color .3s, box-shadow .4s; }
.gc .pick-card:hover, .gc .q-card:hover { border-color: #BDBDBA; box-shadow: 0 18px 40px rgba(0,0,0,.07); }
.gc .pick-card.ink { background: var(--ink); border-color: var(--ink); color: #fff; }
.gc .pick-card p, .gc .q-card p { margin: 0; font-size: 18px; line-height: 1.5; color: var(--mute); }
.gc .pick-card.ink p { color: rgba(255,255,255,.72); }
.gc .qs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.gc .q-card { min-height: 320px; }
.gc .q-k { font-size: 56px; font-weight: 300; line-height: 1; letter-spacing: -0.03em; }
.gc .q-a { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--line); font-size: 16px; font-weight: 500; }

/* ideate */
.gc .rules { display: grid; grid-template-columns: 1fr 1fr; column-gap: 80px; }
.gc .rule { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 16px; padding: 32px 0; border-top: 1px solid var(--line); }
.gc .rule p { margin: 10px 0 0; font-size: 18px; line-height: 1.55; color: #2A2A2A; }

/* design system */
.gc .ds-img { display: block; width: 100%; height: auto; }
.gc .comp { padding: 40px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.02); }
.gc .decisions > .m-k { margin-bottom: 16px; }

/* final design */
.gc .feat-row { display: grid; grid-template-columns: minmax(0, 460fr) minmax(0, 920fr); gap: 60px; align-items: center; margin-top: 120px; }
.gc .feat-row.flip { grid-template-columns: minmax(0, 920fr) minmax(0, 460fr); }
.gc .feat-row.flip .feat-text { order: 2; }
.gc .fx-title { margin: 12px 0 0; font-size: 40px; font-weight: 300; line-height: 1.15; letter-spacing: -0.03em; }
.gc .solves { margin-top: 28px; padding: 20px 24px; background: var(--off); border-left: 2px solid var(--ink); }
.gc .solves p { margin: 6px 0 0; font-size: 16px; line-height: 1.55; }

/* test */
.gc .test-top { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 80px; align-items: end; }
.gc .key { padding: 32px; background: #fff; border: 1px solid var(--line); }
.gc .sus { position: relative; height: 4px; margin-top: 20px; background: var(--line); }
.gc .sus i { position: absolute; inset: 0 auto 0 0; background: var(--ink); }
.gc .sus b { position: absolute; top: -6px; width: 2px; height: 16px; background: var(--mute); }
.gc .slow-row { display: grid; grid-template-columns: 48px 220px minmax(0, 1fr); gap: 16px; padding: 22px 0; border-top: 1px solid var(--line); font-size: 18px; }
.gc .slow-row:last-child { border-bottom: 1px solid var(--line); }
.gc .slow-row p { margin: 0; line-height: 1.55; color: #2A2A2A; }
.gc .limits { padding: 32px; background: #fff; border: 1px solid var(--line); }

/* reflection */
.gc .take { margin-top: 32px; }
.gc .take p { margin: 0; padding: 20px 0; border-top: 1px solid rgba(255,255,255,.15); font-size: 20px; line-height: 1.6; color: rgba(255,255,255,.8); }
.gc .ns-row { display: flex; gap: 24px; padding: 24px 0; border-top: 1px solid rgba(255,255,255,.15); }
.gc .ns-row span { width: 40px; flex: none; font-size: 22px; color: rgba(255,255,255,.45); }
.gc .ns-row p { margin: 0; font-size: 24px; font-weight: 300; line-height: 1.4; color: #fff; }
.gc .next-steps > .m-k { margin-bottom: 16px; }

/* next project */
.gc .next { background: var(--off); }
.gc .next-card { display: flex; flex-direction: column; gap: 16px; padding: 140px 0; }
.gc .next-name { font-size: clamp(56px, 6vw, 112px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; transition: transform .3s ease-out; }
.gc .next-card:hover .next-name { transform: translateX(8px); }

@media (max-width: 1280px) {
  .gc .ov-row, .gc .scenario, .gc .test-top { grid-template-columns: minmax(0, 1fr); gap: 40px; }
}
@media (max-width: 1023px) {
  .gc .acc { display: none; }
  .gc .acc-narrow { display: flex; flex-direction: column; gap: 16px; }
  .gc .acc-narrow .acc-card { cursor: default; }
  .gc .acc-narrow .acc-title { max-width: none; }
  .gc .acc-narrow .acc-body { position: static; width: auto; max-width: none; margin-top: 20px; opacity: 1; }
  .gc .feat-row, .gc .feat-row.flip { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .gc .feat-row.flip .feat-text { order: 0; }
}
@media (max-width: 900px) {
  .gc-nav { grid-template-columns: 1fr auto; } .gc .chapter, .gc .next-link, .gc .back { display: none; }
  .gc .two, .gc .gc-meta, .gc .stats, .gc .stats.four, .gc .two-img, .gc .pick, .gc .qs, .gc .rules { grid-template-columns: minmax(0, 1fr); gap: 32px; }
  .gc .stat { padding: 0; border-left: 0; }
  .gc .gc-h2 { font-size: 40px; }
  .gc .scenario { padding: 32px; }
  .gc .slow-row { grid-template-columns: 40px minmax(0, 1fr); } .gc .slow-row p { grid-column: 2; }
  .gc .gc-table { display: block; overflow-x: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .gc [data-reveal], .gc [data-reveal] img { opacity: 1 !important; transform: none !important; transition: none !important; }
  .gc .acc-card, .gc .acc-title { transition: none; }
}
`
