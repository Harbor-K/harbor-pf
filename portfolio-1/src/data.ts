// ─────────────────────────────────────────────
// 모든 텍스트는 여기서 수정하면 됩니다.
// [대괄호] 안 문구는 아직 확인되지 않은 내용이라 직접 채워 주세요.
// ─────────────────────────────────────────────

export const LINKS = {
  email: 'mailto:harborkim0328@gmail.com',
  emailText: 'harborkim0328@gmail.com',
  instagram: 'https://instagram.com/harbor_0328',
  cal: 'https://cal.com/harbor-kim-wqsmkt/30min',
  resume: '#',
}

export const HERO = {
  title: ['Product designer', 'for fintech & data'],
  primary: 'View work',
  secondary: 'Book a call',
}

export const STATS = [
  { n: '3+', label: ['Years in', 'product'], color: '#33CCFF', tilt: 26 },
  { n: '11', label: ['Languages', 'localised'], color: '#FFC233', tilt: 0 },
  { n: '3', label: ['Countries', 'lived & worked'], color: '#13E35F', tilt: -26 },
]

export const PROJECTS = [
  {
    id: 'trust-bank',
    client: 'Trust Bank Singapore',
    title: ['Rethinking a', 'neo-bank journey'],
    body:
      'UX research and redesign for a Singapore neo-bank. I worked through research and Define, then took the key flows into mid-fidelity screens and a clickable prototype.',
    tags: ['UX research', 'Mid-fi', 'Prototype', '2-person team'],
    gradient: 'radial-gradient(120% 90% at 20% 10%, #3b6cff 0%, #10205e 45%, #05081c 100%)',
  },
  {
    id: 'gamecove',
    client: 'GameCove',
    title: ['Making game data', 'readable'],
    body:
      'An AI game-analytics dashboard. Instead of dropping users into raw charts, an AI agent first maps the game’s structure into an intuitive model — then the user edits it.',
    tags: ['AI agent', 'Dashboard', 'Usability testing', 'Team project'],
    gradient: 'radial-gradient(120% 90% at 80% 20%, #ff3b4f 0%, #6a0d1c 45%, #12030a 100%)',
  },
  {
    id: 'utrada',
    client: 'UTrada',
    title: ['Trading,', 'made clear'],
    body: 'Product design for a Sydney-based trading platform. [Add your role, scope and the outcome here.]',
    tags: ['Fintech', 'Trading', '[Add tag]'],
    gradient: 'radial-gradient(120% 90% at 30% 80%, #ffb347 0%, #7a3a0e 45%, #140802 100%)',
  },
  {
    id: 'eto-markets',
    client: 'ETO Markets · Nov 2022 – Sep 2023',
    title: ['Designing for', 'global traders'],
    body: 'Product design at a Sydney-based trading broker. [Add your role, scope and the outcome here.]',
    tags: ['Fintech', 'Multilingual', '[Add tag]'],
    gradient: 'radial-gradient(120% 90% at 70% 70%, #13e35f 0%, #0b5a2b 45%, #020f07 100%)',
  },
]

export const SHOTS = [
  { tag: 'Trust Bank', cap: '[Caption] Onboarding flow — mid-fidelity screens.', g: 'linear-gradient(160deg,#c9d3ff,#3b4fa8 60%,#0d1440)' },
  { tag: 'GameCove', cap: '[Caption] AI agent maps the game structure before the dashboard.', g: 'linear-gradient(160deg,#f6c08a,#a33a2a 55%,#2a0a08)' },
  { tag: 'Design system', cap: '[Caption] Tokens and components built in Figma.', g: 'linear-gradient(160deg,#ffd0e1,#c74a7b 55%,#3a0f22)' },
  { tag: 'UTrada', cap: '[Caption] Trading screens.', g: 'linear-gradient(160deg,#f2e6c9,#8c6a2c 55%,#241a08)' },
  { tag: 'Localisation', cap: '[Caption] One layout, up to 11 languages.', g: 'linear-gradient(160deg,#c7f5ff,#2a8fa8 55%,#062026)' },
  { tag: 'ETO Markets', cap: '[Caption] Product UI.', g: 'linear-gradient(160deg,#d6ffd9,#2f9a4c 55%,#06200e)' },
]

export const PROCESS = [
  { t: 'Research', d: 'Interviews, desk research and competitor teardowns.', c: '#13E35F' },
  { t: 'Define', d: 'Turning findings into problems worth solving.', c: '#FFC233' },
  { t: 'Design system', d: 'Tokens and components that scale across products.', c: '#33CCFF' },
  { t: 'Prototype & test', d: 'Clickable flows, usability tests, iterate.', c: '#FF4F9A' },
  { t: 'Localise', d: 'Layouts that survive up to 11 languages.', c: '#7364F0' },
]

export const EXPERIENCE = [
  { n: 'ETO Markets', r: 'Product design · Nov 2022 – Sep 2023', c: '#33CCFF', g: 'linear-gradient(160deg,#9fdcff,#1d4f7a 60%,#06131f)' },
  { n: 'Pinetree', r: 'UI/UX design · Aug 2021 – Jun 2022', c: '#FF5A4E', g: 'linear-gradient(160deg,#ffd2c9,#a8402f 60%,#250b07)' },
  { n: 'UTrada', r: 'Product design · Fintech', c: '#FFC233', g: 'linear-gradient(160deg,#ffe9b0,#a8781c 60%,#251a05)' },
  { n: 'Trust Bank', r: 'UX research · Team project', c: '#FF4F9A', g: 'linear-gradient(160deg,#ffc9e0,#a8305f 60%,#250714)' },
  { n: 'GameCove', r: 'AI dashboard · Team project', c: '#13E35F', g: 'linear-gradient(160deg,#c9ffd6,#2a9a4a 60%,#05200c)' },
]

export const OUTCOMES = [
  { mark: 'TRUST BANK', h: ['From research', 'to prototype'], d: 'Research synthesis, Define and a mid-fi prototype for a Singapore neo-bank.', href: '#trust-bank' },
  { mark: 'GAMECOVE', h: ['AI-first', 'data mapping'], d: 'An AI agent structures the game first, so the dashboard starts from a model people understand.', href: '#gamecove' },
  { mark: 'UTRADA', h: ['[Outcome', 'headline]'], d: '[Add a one-line outcome for this project.]', href: '#utrada' },
]

export const TEAMS = ['ETO Markets', 'UTrada', 'Pinetree']

export const BIO =
  'Product designer with a fine-art background and 3+ years across fintech and e-learning. Data-driven, systems-minded, and fluent in multilingual design.'
