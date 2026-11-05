import React, { useEffect, useRef, useState } from 'react'
import { CSS, IMG, IMG3 } from './portfolio'
import { PAGE_CSS, LINKS, TB, SiteHeader, SiteFooter, ClosingCTA, VoiceAssistant, useReveal } from './App'

// Projects and About me landing pages, modelled on rox.com/customers and rox.com/company:
// light header with the current page underlined, two-tone hero, featured media, a filterable card grid,
// photo carousel, mid-page CTA band, the shared dark closing CTA and footer.

const SUB_CSS = `
.sub-page { background: #fff; }
.sub-hero { padding: 200px 0 96px; }
.sub-hero .eyebrow { margin-bottom: 4px; }
.sub-h1 { margin: 20px 0 0; font-size: clamp(56px, 5.4vw, 104px); font-weight: 300; line-height: 1.04; letter-spacing: -0.035em; }
.sub-h1 span { display: block; }
.sub-h1 .mute { color: #8C8C8A; }
.sub-lead { max-width: 720px; margin: 32px 0 0; font-size: 22px; line-height: 1.5; color: var(--mute); }
.sub-ctas { display: flex; gap: 12px; margin-top: 40px; flex-wrap: wrap; }
.btn-ink { background: var(--ink); color: #fff; font-weight: 500; }
.hb .btn-ink { color: #fff; }
.btn-ink:hover { background: #333; }
.btn-line { border: 1px solid var(--ink); color: var(--ink); }
.btn-line:hover { background: var(--ink); color: #fff; }

/* featured media (rox customers video) */
.featured { display: block; position: relative; background: var(--off); padding: 48px; border: 1px solid var(--line); }
.featured .frame { position: relative; aspect-ratio: 2 / 1; overflow: hidden; background: #E9E9E6; }
.featured img, .featured video { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.4s var(--ease); }
.featured:hover img, .featured:hover video { transform: scale(1.025); }
.featured .cap { position: absolute; left: 24px; bottom: 24px; right: 24px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.featured .cap-box { background: #fff; padding: 16px 20px; }
.featured .cap-k { font-size: 16px; color: var(--mute); }
.featured .cap-t { margin-top: 4px; font-size: 22px; font-weight: 500; }
.featured .cap-go { background: var(--ink); color: #fff; padding: 14px 20px; font-size: 16px; font-weight: 500; }

/* filter tabs */
.filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 40px; }
.filters button { padding: 10px 18px; border: 1px solid var(--line); background: #fff; font-size: 16px; color: var(--mute); cursor: pointer; transition: background .25s, color .25s, border-color .25s; }
.filters button:hover { color: var(--ink); border-color: var(--ink); }
.filters button[aria-pressed="true"] { background: var(--ink); color: #fff; border-color: var(--ink); }
.filters .count { margin-left: 6px; opacity: .6; }

/* project cards */
.pgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.pcard { display: flex; flex-direction: column; border: 1px solid var(--line); background: #fff; transition: border-color .3s, transform .5s var(--ease), box-shadow .5s; }
a.pcard:hover { border-color: var(--ink); transform: translateY(-4px); box-shadow: 0 18px 40px rgba(0,0,0,.08); }
.pcard .thumb { aspect-ratio: 16 / 10; overflow: hidden; background: var(--off); border-bottom: 1px solid var(--line); }
.pcard .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.2s var(--ease); }
a.pcard:hover .thumb img { transform: scale(1.04); }
.pcard .tile { width: 100%; height: 100%; display: flex; align-items: flex-end; padding: 24px; font-size: 40px; font-weight: 300; letter-spacing: -0.02em; color: #8C8C8A;
  background-image: radial-gradient(circle, rgba(0,0,0,.14) 1px, transparent 1.4px); background-size: 16px 16px; }
.pcard .body { flex: 1; display: flex; flex-direction: column; padding: 24px; }
.pcard .co { font-size: 16px; color: var(--mute); }
.pcard .head { margin-top: 10px; font-size: 32px; font-weight: 400; letter-spacing: -0.02em; line-height: 1.15; }
.pcard .desc { margin-top: 8px; font-size: 16px; line-height: 1.5; color: #333; }
.pcard .foot-row { margin-top: auto; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 16px; }
.pcard .meta { color: var(--mute); }
.pcard .soon { color: #8C8C8A; }
.pcard.hide { display: none; }

/* photo strip — slow auto-scroll (rox company carousel) */
.photos-head { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 24px; }
.photos-head button { width: 52px; height: 52px; border: 1px solid var(--line); background: #fff; font-size: 20px; color: var(--ink); cursor: pointer; transition: background .2s, color .2s, border-color .2s; }
.photos-head button:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
.photos { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
.photos-track { display: flex; gap: 24px; width: max-content; will-change: transform; }
.photos figure { margin: 0; flex: none; }
.photos img { height: 420px; width: auto; display: block; user-select: none; }
.photos figcaption { margin-top: 12px; font-size: 16px; color: var(--mute); }
@media (max-width: 900px) { .photos img { height: 260px; } }

/* work grid (rox team) */
.wgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.wcard { border: 1px solid var(--line); background: #fff; display: flex; flex-direction: column; }
.wcard .logo-box { aspect-ratio: 1 / 1; overflow: hidden; background: var(--off); border-bottom: 1px solid var(--line); display: grid; place-items: center; }
.wcard .logo-box img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1s var(--ease); }
.wcard:hover .logo-box img { transform: scale(1.04); }
.wcard .logo-box .tile { font-size: 32px; font-weight: 300; color: #8C8C8A; }
.wcard .body { padding: 20px 20px 24px; }
.wcard h3 { margin: 12px 0 0; font-size: 24px; font-weight: 500; }
.wcard p { margin: 6px 0 0; font-size: 16px; color: var(--mute); }
.wcard .period { margin-top: 16px; font-size: 16px; }
.wcard.hide { display: none; }

/* mid CTA band */
.band { background: var(--off); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.band-in { display: flex; justify-content: space-between; align-items: center; gap: 40px; padding: 96px 0; }
.band h2 { margin: 0; font-size: 44px; font-weight: 300; letter-spacing: -0.02em; line-height: 1.15; }
.band h2 .mute { color: #8C8C8A; display: block; }

/* background cards (rox advisors) */
.bgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.bcard { padding: 32px 28px 40px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); min-height: 260px; display: flex; flex-direction: column; }
.bcard .n { font-size: 16px; color: #8C8C8A; }
.bcard .big { margin-top: auto; font-size: 44px; font-weight: 300; letter-spacing: -0.03em; }
.bcard .t { margin-top: 8px; font-size: 18px; font-weight: 500; }
.bcard .s { margin-top: 6px; font-size: 16px; line-height: 1.5; color: var(--mute); }

.tools { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 40px; }

@media (max-width: 1280px) {
  .pgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wgrid, .bgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .sub-hero { padding: 140px 0 64px; }
  .pgrid, .wgrid, .bgrid { grid-template-columns: minmax(0, 1fr); }
  .featured { padding: 16px; }
  .featured .frame { aspect-ratio: 4 / 3; }
  .featured .cap { flex-direction: column; align-items: flex-start; }
  .band-in { flex-direction: column; align-items: flex-start; }
  .band h2 { font-size: 32px; }
}
`

/* ------------------------------------------------------------------ Projects */

type Card = { co: string; head: string; desc: string; meta: string; tags: string[]; href?: string; img?: string; tile?: string; alt?: string }
const CARDS: Card[] = [
  { co: 'Trust Bank Singapore', head: '85 SUS score', desc: 'Turning hidden rewards into everyday loyalty for a digital bank.', meta: 'UX research & redesign · 8 weeks', tags: ['Case study', 'Fintech'], href: '#/trust-bank', img: IMG3 + 'trust-bank-thumb.webp', alt: 'Trust Bank rewards screen' },
  { co: 'GameCove', head: 'AI game analytics', desc: 'A game-analytics dashboard, designed as a team project.', meta: 'Case study · Data dashboard', tags: ['Case study', 'Data'], href: '#/gamecove', img: IMG + 'gamecove.webp', alt: 'GameCove overview dashboard' },
  { co: 'UTrada', head: 'Trading platform', desc: 'Product design for a trading platform.', meta: '2024 – 2026', tags: ['Fintech'], img: IMG3 + 'utrada-screens.webp', alt: 'UTrada website screens' },
  { co: 'ETO Markets', head: 'Trading, Sydney', desc: 'Product design for a trading / fintech company in Sydney.', meta: 'Nov 2022 – Sep 2023', tags: ['Fintech'], img: IMG + 'eto-markets.webp', alt: 'ETO Markets app screen' },
  { co: 'WalletPro', head: 'Design system', desc: 'A fintech / SaaS design system built from scratch in Figma.', meta: 'Design system', tags: ['Design system', 'Fintech'], tile: 'WalletPro' },
  { co: 'Localization', head: '11 languages', desc: 'Multilingual product design in up to 11 languages.', meta: 'Multilingual', tags: ['Design system'], tile: 'Aa 가 あ' },
]
const FILTERS = ['All', 'Case study', 'Fintech', 'Data', 'Design system']

export function ProjectsPage() {
  const [f, setF] = useState('All')
  useReveal()
  const count = (k: string) => (k === 'All' ? CARDS.length : CARDS.filter(c => c.tags.includes(k)).length)
  return (
    <div className="hb sub-page" id="top">
      <style>{CSS + PAGE_CSS + SUB_CSS}</style>
      <SiteHeader current="projects" solid />
      <main>
        <section className="sub-hero">
          <div className="wrap" data-reveal>
            <div className="eyebrow">(Projects)</div>
            <h1 className="sub-h1"><span>Projects, end to end</span><span className="mute">from research to shipped UI.</span></h1>
            <p className="sub-lead">Case studies and product work across digital banking, trading platforms, data dashboards and design systems.</p>
          </div>
        </section>

        <section className="wrap" aria-label="Featured case study">
          <a className="featured" href="#/trust-bank" data-reveal>
            <div className="frame">
              <video src={TB + 'hero-sfx-v2.mp4'} poster={TB + 'hero-sfx-v2-poster.jpg'} autoPlay muted loop playsInline preload="metadata" />
              <div className="cap">
                <div className="cap-box"><div className="cap-k">Featured case study</div><div className="cap-t">Trust Bank Singapore</div></div>
                <span className="cap-go">Read case study →</span>
              </div>
            </div>
          </a>
        </section>

        <section className="sec" aria-label="All projects">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <div>
                <div className="eyebrow">(01) All projects</div>
                <h2 className="h2">Selected work</h2>
              </div>
            </div>
            <div className="filters" role="group" aria-label="Filter projects" data-reveal>
              {FILTERS.map(k => (
                <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{k}<span className="count">{count(k)}</span></button>
              ))}
            </div>
            <div className="pgrid">
              {CARDS.map((c, i) => {
                const hidden = f !== 'All' && !c.tags.includes(f)
                const inner = (
                  <>
                    <div className="thumb">{c.img ? <img src={c.img} alt={c.alt ?? ''} loading="lazy" /> : <div className="tile">{c.tile}</div>}</div>
                    <div className="body">
                      <div className="co">{c.co}</div>
                      <div className="head">{c.head}</div>
                      <div className="desc">{c.desc}</div>
                      <div className="foot-row">
                        <span className="meta">{c.meta}</span>
                        {c.href ? <span>Read <span className="go">→</span></span> : <span className="soon">Coming soon</span>}
                      </div>
                    </div>
                  </>
                )
                const cls = 'pcard' + (hidden ? ' hide' : '')
                const style = { '--d': i % 3 } as React.CSSProperties
                return c.href
                  ? <a className={cls} href={c.href} key={c.co} data-reveal style={style}>{inner}</a>
                  : <article className={cls} key={c.co} data-reveal style={style}>{inner}</article>
              })}
            </div>
          </div>
        </section>

        <ClosingCTA />
      </main>
      <SiteFooter />
      <VoiceAssistant />
    </div>
  )
}

/* ------------------------------------------------------------------ About me */

// Personal photos. TODO: swap in the full-size originals from Figma "About me" › photobbok once uploaded.
const AB = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/about/'
const PHOTOS = [
  { src: AB + 'film-fineart.jpg', cap: 'My paintings in an exhibition' },
  { src: AB + 'drawing-3.jpg', cap: 'Drawing what I see' },
  { src: AB + 'film-places.jpg', cap: 'Sydney and the UK' },
  { src: AB + 'drawing-1.jpg', cap: 'Sketching on location' },
  { src: AB + 'film-fintech.jpg', cap: 'At work' },
  { src: AB + 'drawing-8.jpg', cap: 'Red panda series' },
]

// Photo strip: drifts slowly on its own (pauses on hover); arrows glide one photo back / forward.
// The list is rendered twice so the offset can wrap seamlessly.
function usePhotoStrip(speed = 0.35) {
  const track = useRef<HTMLDivElement>(null)
  const x = useRef(0)
  const target = useRef<number | null>(null)
  const paused = useRef(false)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const tick = () => {
      const t = track.current
      if (t) {
        const half = t.scrollWidth / 2
        if (target.current !== null) {
          const d = target.current - x.current
          x.current += d * 0.12
          if (Math.abs(d) < 0.5) { x.current = target.current; target.current = null }
        } else if (!paused.current && !reduce) {
          x.current += speed
        }
        if (half > 0) {
          if (x.current >= half) { x.current -= half; if (target.current !== null) target.current -= half }
          if (x.current < 0) { x.current += half; if (target.current !== null) target.current += half }
        }
        t.style.transform = `translate3d(${-x.current}px, 0, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speed])
  const step = (dir: number) => {
    const t = track.current; if (!t) return
    const figs = Array.from(t.querySelectorAll<HTMLElement>('figure'))
    const from = target.current ?? x.current
    // snap to the next / previous photo edge
    const edges = figs.map(f => f.offsetLeft)
    const next = dir > 0 ? edges.find(e => e > from + 2) : [...edges].reverse().find(e => e < from - 2)
    target.current = next ?? from + dir * ((figs[0]?.offsetWidth ?? 600) + 24)
  }
  return { track, step, hover: (on: boolean) => { paused.current = on } }
}

const WORK = [
  { co: 'UTrada', domain: 'Trading / fintech platform', period: '2024 – 2026', tag: 'Fintech', img: IMG + 'utrada-logo-square.jpg' },
  { co: 'ETO Markets', domain: 'Trading / fintech · Sydney', period: 'Nov 2022 – Sep 2023', tag: 'Fintech', img: IMG + 'eto-markets-logo-square.jpg' },
  { co: 'Pinetree', domain: 'E-learning · Korea', period: 'Aug 2021 – Jun 2022', tag: 'E-learning', img: IMG + 'pinetree.webp' },
  { co: 'Freelance', domain: 'Upwork & Fiverr clients', period: 'Ongoing', tag: 'Freelance', tile: 'Upwork · Fiverr' },
]
const WORK_FILTERS = ['All', 'Fintech', 'E-learning', 'Freelance']

const BACKGROUND = [
  { big: 'Fine Art', t: 'Where I started', s: 'I trained in Fine Art, drawing what I saw. Observation is still where every project starts.' },
  { big: '3+ yrs', t: 'Product design', s: 'Fintech, crypto / Web3 wallets, digital banking and e-learning.' },
  { big: '11', t: 'Languages', s: 'Multilingual and localised product design in up to 11 languages.' },
  { big: 'AU · UK', t: 'Lived and worked abroad', s: 'Experience living and working in Australia and the UK.' },
]
const TOOLS = ['Figma', 'Design systems', 'Prototyping', 'UX research', 'Usability testing', 'Localization', 'AI design tools']

export function AboutPage() {
  const [f, setF] = useState('All')
  const strip = usePhotoStrip()
  useReveal()

  return (
    <div className="hb sub-page" id="top">
      <style>{CSS + PAGE_CSS + SUB_CSS}</style>
      <SiteHeader current="about" solid />
      <main>
        <section className="sub-hero">
          <div className="wrap" data-reveal>
            <div className="eyebrow">(About me)</div>
            <h1 className="sub-h1"><span>I design clearly through</span><span className="mute">objective observation.</span></h1>
            <p className="sub-lead">I’m Harbor Kim, a product designer with 3+ years in fintech and e-learning. I started in Fine Art, drawing what I saw. Now I look at data, behaviour and context before I design.</p>
            <div className="sub-ctas">
              <a className="btn btn-ink" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
              <a className="btn btn-line" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
        </section>

        <section aria-label="Photos">
          <div className="wrap photos-head">
            <button aria-label="Previous photo" onClick={() => strip.step(-1)}>←</button>
            <button aria-label="Next photo" onClick={() => strip.step(1)}>→</button>
          </div>
          <div className="photos" data-reveal onMouseEnter={() => strip.hover(true)} onMouseLeave={() => strip.hover(false)}>
            <div className="photos-track" ref={strip.track}>
              {[...PHOTOS, ...PHOTOS].map((p, i) => (
                <figure key={i} aria-hidden={i >= PHOTOS.length}><img src={p.src} alt={i < PHOTOS.length ? p.cap : ''} draggable={false} /><figcaption>{p.cap}</figcaption></figure>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" aria-label="Where I've worked">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <div>
                <div className="eyebrow">(01) Experience</div>
                <h2 className="h2">Where I’ve worked</h2>
              </div>
            </div>
            <div className="filters" role="group" aria-label="Filter experience" data-reveal>
              {WORK_FILTERS.map(k => <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{k}</button>)}
            </div>
            <div className="wgrid">
              {WORK.map((w, i) => (
                <article className={'wcard' + (f !== 'All' && w.tag !== f ? ' hide' : '')} key={w.co} data-reveal style={{ '--d': i } as React.CSSProperties}>
                  <div className="logo-box">{w.img ? <img src={w.img} alt={w.co} loading="lazy" /> : <span className="tile">{w.tile}</span>}</div>
                  <div className="body">
                    <span className="tag">{w.tag}</span>
                    <h3>{w.co}</h3>
                    <p>{w.domain}</p>
                    <div className="period">{w.period}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band" aria-label="Work together">
          <div className="wrap band-in" data-reveal>
            <h2>Ready to work together?<span className="mute">I’m open to product design roles.</span></h2>
            <div className="sub-ctas" style={{ marginTop: 0 }}>
              <a className="btn btn-ink" href={LINKS.cal} target="_blank" rel="noreferrer">Book a call</a>
              <a className="btn btn-line" href="#/projects">See projects</a>
            </div>
          </div>
        </section>

        <section className="sec" aria-label="Background">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <div>
                <div className="eyebrow">(02) Background</div>
                <h2 className="h2">What I bring</h2>
              </div>
            </div>
            <div className="bgrid">
              {BACKGROUND.map((b, i) => (
                <div className="bcard" key={b.t} data-reveal style={{ '--d': i } as React.CSSProperties}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <div className="big">{b.big}</div>
                  <div className="t">{b.t}</div>
                  <div className="s">{b.s}</div>
                </div>
              ))}
            </div>
            <div className="tools" data-reveal>{TOOLS.map(t => <span className="tag" key={t}>{t}</span>)}</div>
          </div>
        </section>

        <ClosingCTA />
      </main>
      <SiteFooter />
      <VoiceAssistant />
    </div>
  )
}
