/**
 * Blue-dark tone taken from the home hero (cobalt field + white 3D type with a deep cobalt side),
 * shared by every section below it and by the Work page.
 */
export const DARK = {
  deep: '#050826',
  navy: '#0A1050',
  mid: '#152391',
  cobalt: '#2238D0',
  bright: '#3653F0',
  side: '#1A2BA6',
  sideDeep: '#121C78',
  lav: '#C3C9F2',
  mute: 'rgba(214,220,255,0.7)',
  line: 'rgba(255,255,255,0.14)',
  accent: '#9DB0FF',
};

/** section background: a softer version of the hero's radial cobalt */
export const SECTION_BG = 'radial-gradient(ellipse 85% 70% at 50% 45%, #1B2DB8 0%, #152391 45%, #0A1050 82%, #070B3A 100%)';

/** white type with the hero headline's cobalt extrusion, n px deep */
export const extrude = (n: number) =>
  Array.from({ length: n }, (_, i) => `0 ${i + 1}px 0 ${i >= n - Math.ceil(n / 3) ? DARK.sideDeep : DARK.side}`).join(', ');
