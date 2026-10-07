import type { CSSProperties } from 'react';
import type { Movie } from './data';

export type Fx = 'social' | 'salut' | 'digger' | 'malf' | 'auto';
export type FavKind = 'heart' | 'like' | 'stamp' | 'shovel' | 'tear';

export type Theme = {
  fx: Fx;
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  accentFg: string;
  surface: string;
  display: string;
  body: string;
  mono: string;
  titleCase: 'uppercase' | 'none';
  titleWeight: number;
  titleTracking: string;
  fav: FavKind;
  favLabel: [string, string]; // [ajouter, ajouté]
  tagline?: string;
};

export const BASE: Theme = {
  fx: 'auto',
  bg: '#EBEBE6',
  fg: '#000000',
  muted: '#78716c',
  accent: '#FF6B00',
  accentFg: '#ffffff',
  surface: 'rgba(0,0,0,.06)',
  display: "'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'Inter', system-ui, sans-serif",
  titleCase: 'uppercase',
  titleWeight: 900,
  titleTracking: '-0.04em',
  fav: 'heart',
  favLabel: ['Ajouter', 'Dans ma sélection'],
};

export const SIGNATURE: Record<string, Theme> = {
  // The Social Reckoning — noir, typo fine très espacée, bleu réseau social
  '1000026649': {
    ...BASE,
    fx: 'social',
    bg: '#06080c',
    fg: '#f1f3f6',
    muted: '#7b8494',
    accent: '#1877F2',
    accentFg: '#ffffff',
    surface: 'rgba(24,119,242,.10)',
    display: "'Josefin Sans', sans-serif",
    body: "'Josefin Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
    titleWeight: 300,
    titleTracking: '0.22em',
    fav: 'like',
    favLabel: ["J'aime", 'Vous aimez ça'],
    tagline: 'Nous ne sommes plus là pour nous faire des amis',
  },
  // Notre salut — archives 1940, papier, machine à écrire, tricolore
  '1000007388': {
    ...BASE,
    fx: 'salut',
    bg: '#e9e2d0',
    fg: '#1c2333',
    muted: '#6b6457',
    accent: '#b3262c',
    accentFg: '#f4efe2',
    surface: 'rgba(28,35,51,.07)',
    display: "'DM Serif Display', serif",
    body: "'Special Elite', monospace",
    mono: "'Special Elite', monospace",
    titleCase: 'uppercase',
    titleWeight: 400,
    titleTracking: '0.04em',
    fav: 'stamp',
    favLabel: ['Viser', 'Visé'],
    tagline: 'Vichy, septembre 1940',
  },
  // Digger — vagues bleu-vert, pinceau western, crème
  '327174': {
    ...BASE,
    fx: 'digger',
    bg: '#1f3a3a',
    fg: '#f3ead2',
    muted: '#9fb5a8',
    accent: '#e9d9a8',
    accentFg: '#1f2a24',
    surface: 'rgba(243,234,210,.08)',
    display: "'Rubik Dirt', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Rye', serif",
    titleWeight: 400,
    titleTracking: '0.02em',
    fav: 'shovel',
    favLabel: ['Creuser', 'Creusé'],
    tagline: 'Creuse. Ou crève.',
  },
  // Malfaisante — obscurité, lumière qui suit le doigt, serif dorée
  '1000023068': {
    ...BASE,
    fx: 'malf',
    bg: '#050403',
    fg: '#e8d6bb',
    muted: '#8a7660',
    accent: '#c9945a',
    accentFg: '#0b0806',
    surface: 'rgba(201,148,90,.08)',
    display: "'Cinzel', serif",
    body: "'Cormorant Garamond', serif",
    mono: "'Cinzel', serif",
    titleWeight: 800,
    titleTracking: '0.06em',
    fav: 'tear',
    favLabel: ['Oser', 'Trop tard'],
    tagline: 'Cette fois, ta mère ne te sauvera pas',
  },
};

// --- Thème automatique : palette extraite de l'affiche dans le navigateur ---

type HSL = [number, number, number];

const toHsl = (r: number, g: number, b: number): HSL => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};

const css = ([h, s, l]: HSL) => `hsl(${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%)`;

const cache = new Map<string, Promise<Theme>>();

export function autoTheme(movie: Movie, url: string): Promise<Theme> {
  if (!cache.has(movie.id)) cache.set(movie.id, extract(url).catch(() => BASE));
  return cache.get(movie.id)!;
}

async function extract(url: string): Promise<Theme> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();
  const W = 24, H = 36;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const px = ctx.getImageData(0, 0, W, H).data;

  // Quantification en 12 teintes : la teinte la plus présente donne le fond,
  // la plus saturée donne l'accent.
  const buckets = new Map<number, { n: number; s: number; h: number; l: number }>();
  let vivid: HSL = [24, 1, 0.5], vividScore = 0;
  for (let i = 0; i < px.length; i += 4) {
    const hsl = toHsl(px[i], px[i + 1], px[i + 2]);
    const [h, s, l] = hsl;
    if (l < 0.06 || l > 0.94) continue;
    const k = Math.round(h / 30) % 12;
    const b = buckets.get(k) ?? { n: 0, s: 0, h: 0, l: 0 };
    b.n++; b.s += s; b.h += h; b.l += l;
    buckets.set(k, b);
    const score = s * (1 - Math.abs(l - 0.5) * 2);
    if (score > vividScore) { vividScore = score; vivid = hsl; }
  }
  const dom = [...buckets.values()].sort((a, b) => b.n - a.n)[0];
  if (!dom) return BASE;
  const dh = dom.h / dom.n, ds = Math.min(dom.s / dom.n, 0.55);

  return {
    ...BASE,
    bg: css([dh, ds, 0.09]),
    fg: css([dh, 0.25, 0.94]),
    muted: css([dh, 0.15, 0.62]),
    accent: css([vivid[0], Math.max(vivid[1], 0.6), 0.6]),
    accentFg: css([vivid[0], 0.6, 0.08]),
    surface: css([dh, ds, 0.15]),
  };
}

export const themeVars = (t: Theme) =>
  ({
    '--bg': t.bg,
    '--fg': t.fg,
    '--muted': t.muted,
    '--accent': t.accent,
    '--accent-fg': t.accentFg,
    '--surface': t.surface,
    '--display': t.display,
    '--body': t.body,
    '--mono': t.mono,
  }) as CSSProperties;
