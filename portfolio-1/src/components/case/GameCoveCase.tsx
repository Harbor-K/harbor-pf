import React, { useEffect } from 'react';
import { CaseHeader, NextProjectCard } from './CaseChrome';
import { ProcessAccordion, Stage } from './ProcessAccordion';
import { ASH, BLUE, Body, Container, count, DATA, Eyebrow, H2, H3, HELV, Img, INK, Lead, MUTE, SAND, SKY, Slot, Table, useCountProgress } from './gcKit';

/**
 * GameCove case study — built from Figma "Backup · GameCove_v.2" (node 1210:482, file 44기 김지현 4차 랜딩페이지).
 * Same frame of reference as the Trust Bank page so the projects read as one set: 1440 content column,
 * floating header (× · Next UTrada) and next-project card (CaseChrome), soft fade-up on scroll (CaseReveal),
 * blue numbers that count up as you scroll, hover magnifier on the dense design-system panels.
 * Figma's text is Inter; the site uses Helvetica Neue everywhere (Harbor's rule).
 * Pictures that aren't in the Figma file yet stay as labelled dashed slots, exactly like the Figma.
 * Process: the Figma accordion (hover / click opens a stage).
 */

const L = 'https://raw.githubusercontent.com/Harbor-K/landing_page/main/gamecove/assets/';
const IMG = {
  logo: L + 'logo.png',
  accEmpathize: L + 'acc-empathize.webp',
  accDefine: L + 'acc-define.webp',
  accIdeate: L + 'acc-ideate.webp',
  photo1: L + 'photo-1.webp',
  photo2: L + 'photo-2.webp',
  dsColour: L + 'ds-colour.webp',
  dsType: L + 'ds-type.webp',
  dsSpacing: L + 'ds-spacing.webp',
};
// "View vibecoding site" — the Figma button has no link yet. Put the address here and the button turns into a link.
const VIBE_URL = '';

/* ---------- hero ---------- */

function HeroSection() {
  const meta: [string, string][] = [
    ['TIMELINE', '9 weeks\nAugust – October 2026'],
    ['TEAM & ROLE', '2 product designers\nMy part: UI design, data visualisation, design system, test plan and scoring\nTogether: AI agent design'],
    ['PLATFORM', 'Desktop web · Game analytics (B2B)\nAI agent'],
  ];
  const btn = 'inline-flex items-center rounded-[8px] bg-[#a9c8fc] px-5 py-3 text-[16px] font-semibold leading-[26px] text-[#0a0a0c]';
  return (
    <section data-tone="dark" className="relative overflow-hidden bg-[#0a0a0c] pb-[120px] pt-[120px] md:pt-[140px]" style={{ fontFamily: HELV }}>
      {/* spotlights */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: 'calc(50% - 1260px)', top: -520, width: 1500, height: 1100, background: 'radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0))', filter: 'blur(120px)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: 'calc(50% - 660px)', top: -300, width: 1300, height: 700, background: 'radial-gradient(closest-side, rgba(255,255,255,0.06), rgba(255,255,255,0))', filter: 'blur(120px)' }}
      />
      <Container className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-[14px] rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] py-2 pl-4 pr-5">
          <img src={IMG.logo} alt="GameCove" className="h-[28px] w-auto" />
          <span className="h-[18px] w-px bg-[rgba(255,255,255,0.2)]" aria-hidden />
          <span className="text-[16px] font-medium leading-6 text-[#d0d2d8]">Product design case study</span>
        </div>
        <h1 className="mt-[30px] max-w-[1100px] text-[40px] font-semibold leading-[1.1] tracking-[-1px] text-white md:text-[64px] md:tracking-[-1.6px]">
          Helping first-time game creators
          <br className="hidden md:block" /> decide what to fix next
        </h1>
        <p className="mt-6 text-[18px] leading-[32px] text-[#a7a9b0] md:text-[20px]">An AI analytics dashboard that reads your game first</p>
        <div className="mt-10">
          {VIBE_URL ? (
            <a href={VIBE_URL} target="_blank" rel="noreferrer" className={`${btn} transition-opacity hover:opacity-90`}>
              View vibecoding site
            </a>
          ) : (
            <span className={btn} aria-disabled="true">
              View vibecoding site
            </span>
          )}
        </div>
      </Container>

      <Container className="mt-[60px] md:mt-20">
        {/* hero banner: picture slot (GameCove Ver.2) */}
        <div
          className="relative overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[#0e0e10]"
          style={{ aspectRatio: '2 / 1', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}
          role="img"
          aria-label="Hero image coming soon: AI Mapping canvas and Overview with AI briefing (GameCove Ver.2)"
        >
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <span className="max-w-[600px] text-center text-[16px] leading-[26px] text-[#b3d1ff]">Image · Hero · AI Mapping canvas + Overview with AI briefing (GameCove Ver.2)</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[30.5%]" style={{ background: 'linear-gradient(180deg, rgba(10,10,12,0) 0%, rgba(10,10,12,0.85) 100%)' }} />
        </div>
      </Container>

      <Container className="mt-[60px]">
        <div className="grid grid-cols-1 gap-10 border-t border-[rgba(255,255,255,0.1)] pt-10 md:grid-cols-3">
          {meta.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-[10px]">
              <p className="text-[17px] leading-[27px] tracking-[0.5px] text-[#8a8c93]">{k}</p>
              <p className="whitespace-pre-line text-[18px] leading-[29px] text-[#f2f0ec]">{v}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- overview ---------- */

function OverviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[330px_1fr] md:gap-10">
      <p className="text-[23px] font-bold leading-[1.2]" style={{ fontFamily: HELV, color: INK }}>
        {label}
      </p>
      <div className="max-w-[1070px]">{children}</div>
    </div>
  );
}

function OverviewSection() {
  const [ref, p] = useCountProgress<HTMLDivElement>();
  const stats: [React.ReactNode, string][] = [
    [count(85.5, p), 'ease-of-use score (SUS, A+)'],
    [<>{Math.round(2 * p)} of 3</>, 'hidden problems found by users'],
    [<>{Math.round(3 * p)} of 3</>, 'used the data to form a hypothesis'],
  ];
  return (
    <section className="bg-white py-[120px]">
      <Container className="flex flex-col gap-[60px]">
        <Eyebrow label="OVERVIEW" text={ASH} />
        <OverviewRow label="The problem">
          <Body>
            AI made it easy to build a game. Fixing it after launch is still hard. The Roblox dashboard shows how many players left, but not where or why. Creators can set up their own tracking, but
            beginners don’t know what to track. So they guess.
          </Body>
        </OverviewRow>
        <OverviewRow label="Solution">
          <Body>
            GameCove reads the game first and draws its structure as a map. The creator checks the map, picks a goal, and GameCove suggests what to track. Then the dashboard opens with the 2–3 changes
            worth a look, and an AI agent answers follow-up questions.
          </Body>
        </OverviewRow>
        <OverviewRow label="Impact">
          <div ref={ref} className="grid grid-cols-1 gap-8 sm:grid-cols-3" style={{ fontFamily: HELV }}>
            {stats.map(([v, l], i) => (
              <div key={i}>
                <p className="text-[44px] leading-[1.12] tabular-nums md:text-[52px]" style={{ color: DATA }}>
                  {v}
                </p>
                <p className="mt-1 text-[16px] leading-[1.45]" style={{ color: MUTE }}>
                  {l}
                </p>
              </div>
            ))}
          </div>
        </OverviewRow>
      </Container>
    </section>
  );
}

/* ---------- process ---------- */

const STAGES: Stage[] = [
  {
    stage: 'EMPATHIZE',
    no: '01',
    title: 'What do creators and players need?',
    items: ['27 creator posts', '47 player reviews + 39 feedback posts', 'Research papers & existing tools', 'Creator interviews'],
    img: IMG.accEmpathize,
    imgRatio: '420 / 217',
    alt: 'Creator user journey map (upstream journey)',
  },
  {
    stage: 'DEFINE',
    no: '02',
    title: 'One problem + 3 questions',
    items: ['Affinity map', 'Thematic analysis', 'Problem statement & HMW', '3 design questions'],
    img: IMG.accDefine,
    imgRatio: '420 / 217',
    alt: 'Define board: problem definition, the problem to solve first, and three design questions',
  },
  {
    stage: 'IDEATE',
    no: '03',
    title: '6 rules + first ideas',
    items: ['6 design principles', 'Low-fi sketches & wireflow'],
    img: IMG.accIdeate,
    imgRatio: '420 / 281',
    alt: 'Hand sketch of genre- and game-specific metric groups',
  },
  {
    stage: 'PROTOTYPE',
    no: '04',
    title: 'From sketch to coded prototype',
    items: ['Mid-fi → Hi-fi', 'Dark / light design system', 'Vibe-coded prototype'],
    slot: 'Image · GameCove Ver.2 · hi-fi screens',
    imgRatio: '420 / 217',
  },
  {
    stage: 'TEST',
    no: '05',
    title: 'Usability test + fixes',
    items: ['Sample game with 3 hidden problems', '5 test sessions, SUS + SEQ', 'Fix list'],
    slot: 'Image · UT session capture (masked)',
    imgRatio: '420 / 217',
  },
];

function ProcessSection() {
  return (
    <section className="bg-[#b2b2b2] py-[120px]">
      <Container className="flex flex-col gap-10">
        <Eyebrow label="PROCESS" />
        <H2>5 stages, 2 turning points</H2>
        <ProcessAccordion stages={STAGES} />
        <div className="flex flex-col gap-2 text-[16px] font-medium leading-[26px]" style={{ color: BLUE, fontFamily: HELV }}>
          <p>↺&nbsp; We narrowed the idea from “explain player behaviour” to “give creators the information they need”</p>
          <p>↺&nbsp; After teacher feedback, we moved from solo users (B2C) to teams sharing one game (B2B)</p>
        </div>
      </Container>
    </section>
  );
}

/* ---------- empathize ---------- */

function DeskCard({ slot, title, sub, body }: { slot: string; title: string; sub: string; body: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Slot label={slot} ratio="700 / 380" />
      <div>
        <H3>{title}</H3>
        <p className="mt-4 text-[16px] leading-[26px]" style={{ color: MUTE, fontFamily: HELV }}>
          {sub}
        </p>
        <Body className="mt-4">{body}</Body>
      </div>
    </div>
  );
}

function EmpathizeSection() {
  const chain = ['Goal', 'Question', 'Behaviour to watch', 'Data to log'];
  return (
    <section className="bg-white py-[120px]">
      <Container className="flex flex-col gap-10">
        <Eyebrow label="EMPATHIZE" square={MUTE} />
        <Lead
          title={'Making a game got easy.\nFixing it didn’t.'}
          body="Roblox Studio and AI tools let beginners launch a game in a few months. But the basic dashboard only shows results, like playtime and drop-off rate. It doesn’t show which stage or obstacle makes players quit."
        />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <DeskCard
            slot="Image · Creator journey (FigJam)"
            title="What creators wrote"
            sub="27 posts from Roblox forums"
            body="Creators knew something was wrong, but not where. They asked the community, changed many things at once, and lost track of what worked."
          />
          <DeskCard
            slot="Image · Player review analysis (FigJam)"
            title="What players wrote"
            sub="47 reviews + 39 requested feedback posts"
            body="Players decide in the first few minutes. If something feels off, they leave before seeing the rest. Reviews rarely show what happened in between, so we needed behaviour data."
          />
        </div>
        <div className="h-px w-full bg-[rgba(17,17,20,0.1)]" />
        <Lead
          title={'Creators want a fast fix,\nnot a perfect answer'}
          body="We interviewed 3 creators, then held a second interview with a professional game developer. Creators fixed things as soon as a cause looked likely, then checked the numbers. The expert linked four things from the start. Beginners had the goal, but couldn’t turn it into a question."
        />
        <div>
          <div className="flex flex-wrap items-center gap-[10px]" style={{ fontFamily: HELV }}>
            {chain.map((c, i) => (
              <React.Fragment key={c}>
                {i > 0 && (
                  <span className="text-[23px]" style={{ color: MUTE }} aria-hidden>
                    →
                  </span>
                )}
                <span
                  className="rounded-[40px] px-6 py-[14px] text-[18px] font-bold leading-[29px]"
                  style={i === 0 ? { background: SAND, color: INK } : { background: INK, color: '#ffffff' }}
                >
                  {c}
                </span>
              </React.Fragment>
            ))}
          </div>
          <p className="mt-10 text-[16px] leading-[26px]" style={{ color: MUTE, fontFamily: HELV }}>
            Beginners stop after “Goal”. Experts connect all four.
          </p>
        </div>
        <div>
          <Table
            className="max-w-[900px]"
            cols="240px 420px 200px"
            head={['Who', 'Experience', 'Where']}
            rows={[
              ['Student creator', 'Game high school, teen', 'Korea'],
              ['Game developer', 'Works at a game company, 20s', 'Korea'],
              ['Hobby creator', 'Makes games for fun, teen', 'Belgium'],
            ]}
          />
          <p className="mt-10 text-[16px] leading-[26px]" style={{ color: MUTE, fontFamily: HELV }}>
            Minors joined with guardian consent. Names and faces are not shown.
          </p>
        </div>
        <Slot label="Image · Interview affinity map + thematic analysis (FigJam)" ratio="1440 / 560" />
        <div className="grid grid-cols-1 gap-6 rounded-[10px] px-6 py-10 md:grid-cols-[330px_1fr] md:gap-[60px] md:px-[60px] md:py-[50px]" style={{ background: SAND }}>
          <div className="flex flex-col gap-[10px]">
            <p className="text-[17px] leading-[27px] tracking-[0.5px]" style={{ color: MUTE, fontFamily: HELV }}>
              PROBLEM SCENARIO
            </p>
            <H2>Meet Sunghyun</H2>
          </div>
          <Body>
            {
              'Sunghyun built a ball-rolling stage game in 3 months with help from AI. Two weeks after launch, he wants to add Stage 5. His dashboard shows playtime and drop-off rate, but not which obstacle is too hard or too easy.\n\nThe data keeps piling up. It just doesn’t help him decide.'
            }
          </Body>
        </div>
      </Container>
    </section>
  );
}

/* ---------- define ---------- */

function DefineSection() {
  const qs = [
    ['A', 'How do we collect data?', 'Beginners shouldn’t have to write tracking code.', '→ AI Mapping + goal-based tracking'],
    ['B', 'How do we show it?', 'Once tracked, there’s too much to look at.', '→ Goal-based analysis board'],
    ['C', 'How do we help them read it?', '“Stage 4 clear rate 57%”. Is that a problem?', '→ AI briefing + AI agent'],
  ];
  return (
    <section className="py-[120px]" style={{ background: SAND }}>
      <Container className="flex flex-col gap-10">
        <Eyebrow label="DEFINE" square={BLUE} />
        <Lead
          title={'The problem wasn’t reading data.\nIt was knowing what to check.'}
          body="Roblox already lets creators track each stage with funnels and custom events. Beginners didn’t use them. Not because the tool was missing, but because they didn’t know what to track."
        />
        <div className="rounded-[10px] px-6 py-14 text-center md:px-[120px] md:py-20" style={{ background: INK, fontFamily: HELV }}>
          <p className="text-[17px] leading-[27px] tracking-[0.5px]" style={{ color: SKY }}>
            HOW MIGHT WE
          </p>
          <H2 color="#ffffff" className="mx-auto mt-4 max-w-[1000px]">
            Help creators who are new to data find evidence fast, and make better update decisions?
          </H2>
        </div>
        <div>
          <H3>We picked one problem to solve first</H3>
          <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2" style={{ fontFamily: HELV }}>
            <div className="rounded-[10px] p-[30px]" style={{ background: INK }}>
              <p className="text-[16px] font-bold leading-[26px]" style={{ color: SKY }}>
                SOLVE NOW
              </p>
              <H3 color="#ffffff" className="mt-3">
                No behaviour data
              </H3>
              <Body color="#f2f0ec" className="mt-3">
                Creators want to fix fast and check the result. Behaviour data feeds that loop directly.
              </Body>
            </div>
            <div className="rounded-[10px] bg-white p-[30px]">
              <p className="text-[16px] font-bold leading-[26px]" style={{ color: BLUE }}>
                LATER
              </p>
              <H3 className="mt-3">No reasons from players</H3>
              <Body className="mt-3">Important, but it fills gaps that behaviour data can’t explain. We kept it as a next step.</Body>
            </div>
          </div>
        </div>
        <div>
          <H3>3 questions to design for</H3>
          <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-3" style={{ fontFamily: HELV }}>
            {qs.map(([k, t, b, a]) => (
              <div key={k} className="flex flex-col rounded-[10px] bg-white p-[30px]">
                <p className="text-[37px] font-bold leading-[1.12]" style={{ color: BLUE }}>
                  {k}
                </p>
                <H3 className="mt-4">{t}</H3>
                <Body className="mt-3">{b}</Body>
                <p className="mt-4 text-[16px] font-bold leading-[26px]" style={{ color: BLUE }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- ideate ---------- */

const RULES = [
  ['01', 'Start from a question', 'Show pages built around what the creator wants to check, plus a page of basic metrics.'],
  ['02', 'Suggest, don’t lock in', 'AI builds a bundle of charts. The creator can pick, mix and edit it.'],
  ['03', 'Go step by step', 'Overview → problem signal → comparison → player evidence.'],
  ['04', 'Keep ideas next to evidence', 'Link each hypothesis to the data for and against it. AI offers other explanations too.'],
  ['05', 'Explain inside the chart', 'Short titles and notes on the chart, not long AI reports.'],
  ['06', 'The creator makes the call', 'AI starts and widens the analysis. The direction and final decision stay with the creator.'],
];

function IdeateSection() {
  return (
    <section className="bg-white py-[120px]">
      <Container className="flex flex-col gap-10">
        <Eyebrow label="IDEATE" square={BLUE} />
        <Lead
          title={'6 rules from research:\nAI goes first, the creator decides'}
          body="Research on sensemaking showed that beginners need a starting point, not more charts. So the AI should act as a guide, not a judge. Its suggestions must be easy to check and change."
        />
        <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2" style={{ fontFamily: HELV }}>
          {RULES.map(([n, t, b]) => (
            <div key={n} className="border-t py-[30px]" style={{ borderColor: 'rgba(17,17,20,0.1)' }}>
              <p className="text-[18px] font-medium leading-[29px]" style={{ color: BLUE }}>
                {n}
              </p>
              <H3 className="mt-2">{t}</H3>
              <Body className="mt-3">{b}</Body>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <Slot label="Image · Low-fi wireflow" ratio="700 / 470" />
          <Slot label="Image · Low-fi sketches" ratio="700 / 470" />
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <Img src={IMG.photo1} alt="Harbor reviewing screens on a laptop during the ideation session" className="rounded-[10px]" ratio="700 / 467" />
          <Img src={IMG.photo2} alt="Harbor explaining a design idea to her teammate" className="rounded-[10px]" ratio="700 / 467" />
        </div>
      </Container>
    </section>
  );
}

/* ---------- prototype ---------- */

function PrototypeSection() {
  const light = ['Low-fi sketch', 'Wireflow (teacher review)', 'Mid-fi', 'Metrics locked', 'Page hierarchy'];
  const dark = ['Hi-fi', 'Vibe-coded prototype'];
  const pill = 'rounded-[40px] px-5 py-3 text-[16px] font-medium leading-[26px]';
  return (
    <section className="py-[120px]" style={{ background: SAND }}>
      <Container className="flex flex-col gap-10">
        <Eyebrow label="PROTOTYPE" square={BLUE} />
        <H2>From sketch to a coded prototype</H2>
        <div className="flex flex-wrap items-center gap-[10px]" style={{ fontFamily: HELV }}>
          {[...light, ...dark].map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && (
                <span className="text-[16px]" style={{ color: MUTE }} aria-hidden>
                  →
                </span>
              )}
              <span className={`${pill} ${i < light.length ? 'border border-[rgba(17,17,20,0.12)] bg-[#f2f0ec] text-[#111114]' : 'bg-[#111114] text-white'}`}>{t}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <Slot label="Image · Mid-fi → Hi-fi screens" ratio="700 / 470" />
          <Slot label="Image · Vibe-coded prototype (live)" ratio="700 / 470" />
        </div>
      </Container>
    </section>
  );
}

/* ---------- design system ---------- */

function DesignSystemSection() {
  const [ref, p] = useCountProgress<HTMLDivElement>();
  const stats: [number, string][] = [
    [19, 'core colours'],
    [31, 'semantic tokens'],
    [24, 'spacing, radius & size tokens'],
    [6, 'text styles'],
  ];
  return (
    <section data-tone="dark" className="py-[120px]" style={{ background: INK }}>
      <Container className="flex flex-col gap-10">
        <Eyebrow label="PROTOTYPE · DESIGN SYSTEM" square={SKY} text={SKY} />
        <Lead
          color="#ffffff"
          bodyColor="#f2f0ec"
          title={'One token system\nfor a dark data dashboard'}
          body="I built the GameCove design system in 3 layers: raw colours, tokens named by their job, and components. Screens use the tokens, not raw colours, so a light mode can be added by mapping new values."
        />
        <div ref={ref} className="grid grid-cols-2 gap-10 md:grid-cols-4" style={{ fontFamily: HELV }}>
          {stats.map(([n, l]) => (
            <div key={l} className="border-l border-[#34343d] pl-6">
              <p className="text-[44px] leading-[1.12] text-white tabular-nums md:text-[52px]">{Math.round(n * p)}</p>
              <p className="mt-1 text-[16px] leading-[1.45] text-[#a7a9b0]">{l}</p>
            </div>
          ))}
        </div>
        <Img src={IMG.dsColour} alt="Colour: 9 core colours (neutral, sand, blue, coral) and how they map to semantic tokens like color/bg/canvas and chart/series/exit" zoom />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <Img src={IMG.dsType} alt="Typography in Lato: Display/Page Bold 40, Display/Metric Bold 28, Title/Card 20, Body 16, Label 14, Caption 12" zoom />
          <Img src={IMG.dsSpacing} alt="Spacing tokens from 4 to 64 px and radius tokens none, sm 4, md 8, lg 16, full" zoom />
        </div>
        <div className="rounded-[16px] border border-[#2a2d31] bg-[#17171b] p-6 md:p-10" style={{ fontFamily: HELV }}>
          <p className="text-[24px] font-bold leading-[1.2] text-white">Components</p>
          <Body color="#f2f0ec" className="mt-5 max-w-[900px]">
            Navigation, top bars, KPI cards, retention and stage-progression chart cards, the AI agent panel, modals and tooltips. Every chart card is built from the same tokens, so new boards stay
            consistent.
          </Body>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Slot dark label="Image · Components · nav + top bar + KPI row" ratio="642 / 347" />
            <Slot dark label="Image · Components · chart cards + AI agent panel" ratio="642 / 347" />
          </div>
        </div>
        <div className="rounded-[10px] bg-[#17171b] px-[30px] py-6" style={{ fontFamily: HELV }}>
          <p className="text-[16px] font-bold leading-[26px]" style={{ color: SKY }}>
            DESIGN DECISIONS FROM FEEDBACK
          </p>
          <Body color="#f2f0ec" className="mt-[10px]">
            {'· Drop-off had to stand out, so exits get the only warm colour (coral).\n· AI should feel distinct, so AI features use the light-blue accent and a spark icon.'}
          </Body>
        </div>
      </Container>
    </section>
  );
}

/* ---------- final design ---------- */

const FEATURES = [
  {
    no: '01',
    title: 'AI Mapping',
    body: 'AI reads the game scripts and draws Lobby → Stage 1–4 as a map. The creator reviews, edits and confirms it.',
    solves: 'Beginners can’t turn what they built into questions. And AI can’t suggest anything useful without knowing the game.',
    slot: 'Image · AI Mapping · node map + structure detail panel',
  },
  {
    no: '02',
    title: 'Goal-based setup',
    body: 'The creator picks a goal, like “Where do players get stuck?”. GameCove shows what it can track now and what needs extra setup.',
    solves: 'Creators don’t know what to track.',
    slot: 'Image · Analysis goal → Tracking → Logging',
  },
  {
    no: '03',
    title: 'AI briefing + AI agent',
    body: 'The dashboard opens with the 2–3 biggest changes and suggested questions. Creators ask follow-ups in plain words.',
    solves: 'Creators don’t know where to start looking.',
    slot: 'Image · Overview with AI briefing + AI agent panel',
  },
];

function FinalDesignSection() {
  return (
    <section className="py-[120px]" style={{ background: SAND }}>
      <Container className="flex flex-col gap-[60px]">
        <Eyebrow label="PROTOTYPE · FINAL DESIGN" square={BLUE} />
        <Lead
          title="The final design: 3 features"
          body="Feature 1 is what makes GameCove different from other dashboards. Features 2 and 3 build on the map it creates."
        />
        {FEATURES.map((f, i) => {
          const flip = i % 2 === 1; // picture on the left for feature 2
          return (
            <div key={f.no} className={`grid grid-cols-1 items-center gap-8 md:gap-[60px] ${flip ? 'lg:grid-cols-[920fr_460fr]' : 'lg:grid-cols-[460fr_920fr]'}`}>
              <div className={flip ? 'lg:order-2' : ''} style={{ fontFamily: HELV }}>
                <p className="text-[18px] font-medium leading-[29px]" style={{ color: BLUE }}>
                  {f.no}
                </p>
                <H2 className="mt-2">{f.title}</H2>
                <Body className="mt-4">{f.body}</Body>
                <div className="mt-6 rounded-[10px] bg-white px-5 py-4">
                  <p className="text-[16px] font-bold leading-[26px]" style={{ color: BLUE }}>
                    SOLVES
                  </p>
                  <p className="mt-1 text-[16px] leading-[26px]" style={{ color: INK }}>
                    {f.solves}
                  </p>
                </div>
              </div>
              <div className={flip ? 'lg:order-1' : ''}>
                <Slot label={f.slot} ratio="920 / 560" />
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}

/* ---------- test ---------- */

function TestSection() {
  const [ref, p] = useCountProgress<HTMLDivElement>();
  const found = (ok: boolean) => <span style={{ color: ok ? '#15803d' : '#c2410c' }}>{ok ? 'Found' : 'Not found'}</span>;
  const slowed = [
    ['01', 'Mapping', 'Users understood the map, but not why they were making it. Even the expert thought he was designing a new game.'],
    ['02', 'AI setup', 'Users couldn’t check what the AI had set up, so they felt unsure about it.'],
    ['03', 'AI agent', 'One user never noticed the AI agent.'],
    ['04', 'Charts', 'Striped charts tired some users’ eyes. Numbers only showed on hover.'],
  ];
  const fixes = [
    ['Mapping', 'Starts with no reason given', 'Explains the purpose first: “check your game’s structure so the analysis fits”'],
    ['AI setup', 'Approval step is easy to miss', 'A clear approval step, plus a screen that shows what was applied'],
    ['AI agent', 'One button in the top bar', '“Ask AI” next to each chart'],
    ['Charts', 'Striped bars, hover to see numbers', 'Standard charts by default, key numbers always shown, benchmarks from similar games'],
  ];
  const line = { borderColor: 'rgba(17,17,20,0.1)' };
  return (
    <section className="bg-white py-[120px]">
      <Container className="flex flex-col gap-10">
        <Eyebrow label="TEST" square={BLUE} />
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1000px_1fr]">
          <Lead
            width={760}
            title={'Usability test: the flow worked,\nthe start didn’t'}
            body="5 remote sessions with think-aloud. 3 tasks: check the map, pick a goal, then explore the data and decide what to fix. We didn’t tell anyone to use the AI agent. We wanted to see if they would find it."
          />
          <div ref={ref} className="rounded-[10px] p-[30px]" style={{ background: SAND, fontFamily: HELV }}>
            <p className="text-[52px] leading-[1.12] tabular-nums" style={{ color: INK }}>
              {count(85.5, p)}
            </p>
            <p className="mt-5 text-[16px] leading-[26px]" style={{ color: INK }}>
              average SUS score (A+). Our goal was 90.
            </p>
          </div>
        </div>
        <div>
          <H3>We hid 3 problems in the sample data</H3>
          <Table
            className="mt-10"
            cols="520px 200px 1fr"
            head={['Hidden problem', 'Found?', 'Who found it']}
            rows={[
              ['A · Stage 4 is too hard', found(true), '1 participant (the expert), via the AI briefing'],
              ['B · New players leave early', found(true), '2 participants, from the Lobby → Stage 1 drop'],
              ['C · Players quit after finishing', found(false), 'No one'],
            ]}
          />
          <Body className="mt-10 max-w-[760px]">
            Finding problems we planned is stronger proof than “users found a problem”. 3 of 3 core participants used data to form a hypothesis.
          </Body>
        </div>
        <Slot label="Image · UT session capture (masked) + task / SEQ table" ratio="1440 / 560" />
        <div style={{ fontFamily: HELV }}>
          <H3>What slowed users down</H3>
          <div className="mt-10">
            {slowed.map(([n, t, b]) => (
              <div key={n} className="grid grid-cols-[40px_1fr] gap-x-5 border-b py-5 md:grid-cols-[21px_200px_1fr] md:gap-x-10" style={line}>
                <span className="text-[18px] leading-[29px]" style={{ color: BLUE }}>
                  {n}
                </span>
                <span className="text-[18px] font-bold leading-[29px]" style={{ color: INK }}>
                  {t}
                </span>
                <span className="col-span-2 text-[18px] leading-[29px] md:col-span-1" style={{ color: INK }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: HELV }}>
          <H3>What we’re fixing</H3>
          <div className="mt-10 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[200px_1fr_1fr] gap-10 border-b pb-3 text-[16px] leading-[26px]" style={{ ...line, color: MUTE }}>
                <span />
                <span>Before</span>
                <span>After</span>
              </div>
              {fixes.map(([t, b, a]) => (
                <div key={t} className="grid grid-cols-[200px_1fr_1fr] gap-10 border-b py-5 text-[18px] leading-[29px]" style={line}>
                  <span className="font-bold" style={{ color: INK }}>
                    {t}
                  </span>
                  <span style={{ color: MUTE }}>{b}</span>
                  <span style={{ color: INK }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <Slot label="Image · Before · Ver.2 screen" ratio="700 / 470" />
          <Slot label="Image · After · revised screen" ratio="700 / 470" />
        </div>
        <div className="rounded-[10px] px-[30px] py-6" style={{ background: SAND, fontFamily: HELV }}>
          <p className="text-[16px] font-bold leading-[26px]" style={{ color: BLUE }}>
            LIMITS
          </p>
          <Body className="mt-[10px]">
            Only 3 people were in the core analysis, and most participants were teens. That doesn’t match our target of small studios. The sample game was simple, and logging settings didn’t flow
            into the dashboard. These results show a direction, not proof.
          </Body>
        </div>
      </Container>
    </section>
  );
}

/* ---------- reflection ---------- */

function ReflectionSection() {
  const takeaways = [
    'Users expect AI to give the answer. My next challenge is helping them reason for themselves, not just accept what AI says.',
    'Score “doing” and “understanding” separately. A user can press confirm without knowing why. That is how we found the mapping problem.',
    'Handoff goes both ways. As a receiver, I want to see the process as it happens. As a giver, I should explain every step.',
  ];
  const next = [
    'Test the fixes with one more user on a real desktop screen, and compare before and after.',
    'Test with adult creators from small studios.',
    'After launch, track setup completion, AI agent use and weekly return visits.',
  ];
  return (
    <section data-tone="dark" className="py-[120px]" style={{ background: INK, fontFamily: HELV }}>
      <Container className="flex flex-col gap-10">
        <Eyebrow label="REFLECTION" square={SKY} text={SKY} />
        <H2 color="#ffffff">Takeaways</H2>
        <div className="flex max-w-[1000px] flex-col gap-6">
          {takeaways.map((t, i) => (
            <div key={i} className="grid grid-cols-[40px_1fr] gap-x-4">
              <span className="text-[18px] font-medium leading-[29px]" style={{ color: SKY }}>
                0{i + 1}
              </span>
              <Body color="#ffffff">{t}</Body>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <p className="text-[16px] font-medium leading-[26px] text-[#a7a9b0]">Next steps</p>
          <div className="mt-6 flex flex-col gap-5">
            {next.map((t, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr] gap-x-4">
                <span className="text-[18px] font-medium leading-[32px]" style={{ color: SKY }}>
                  0{i + 1}
                </span>
                <p className="text-[19px] font-medium leading-[32px] text-white md:text-[22px]">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- page ---------- */

// the UTrada card at the end opens the next case study (hash route on this site)
const NEXT_HREF = '#/utrada';

export function GameCoveCase({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-white" style={{ color: INK }}>
      <CaseHeader onClose={onClose} nextName="UTrada" />
      <main>
        <HeroSection />
        <OverviewSection />
        <ProcessSection />
        <EmpathizeSection />
        <DefineSection />
        <IdeateSection />
        <PrototypeSection />
        <DesignSystemSection />
        <FinalDesignSection />
        <TestSection />
        <ReflectionSection />
      </main>
      <NextProjectCard name="UTrada" href={NEXT_HREF} />
    </div>
  );
}
