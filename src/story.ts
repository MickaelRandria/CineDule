import { cinemas, dateLabel, posterAt, type Movie, type Session } from './data';
import type { Theme } from './themes';

const W = 1080;
const H = 1920;
const POSTER_H = 1080;

const fontOf = (family: string, weight: number, size: number) => `${weight} ${size}px ${family}`;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const loadImg = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

/** Image 1080×1920 au format story, dessinée dans l'identité du film choisi. */
export async function storyImage(m: Movie, s: Session, t: Theme): Promise<Blob> {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const pad = 88;

  await Promise.all([
    document.fonts.load(fontOf(t.display, t.titleWeight, 120)),
    document.fonts.load(fontOf(t.mono, 700, 60)),
    document.fonts.load(fontOf("'Inter'", 900, 60)),
  ]).catch(() => {});

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Affiche en haut, recadrée, avec un fondu vers la couleur du thème
  try {
    const img = await loadImg(posterAt(m.poster, 800));
    const ph = POSTER_H;
    const scale = Math.max(W / img.width, ph / img.height);
    const iw = img.width * scale, ih = img.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, ph);
    ctx.clip();
    if (t.fx === 'salut') ctx.filter = 'grayscale(.8) sepia(.3) contrast(1.15)';
    // Cadrage sur le haut de l'affiche (visages), le bas part dans le fondu
    ctx.drawImage(img, (W - iw) / 2, 0, iw, ih);
    ctx.filter = 'none';
    ctx.restore();
    const g = ctx.createLinearGradient(0, ph * 0.45, 0, ph);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.75, t.bg);
    g.addColorStop(1, t.bg);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, ph);
  } catch {
    /* affiche indisponible : fond uni */
  }

  let y = POSTER_H - 40;

  // Surtitre
  ctx.fillStyle = t.accent;
  ctx.font = fontOf("'Inter'", 800, 34);
  ctx.letterSpacing = '8px';
  ctx.fillText(`MON CHOIX · ${dateLabel.toUpperCase()}`, pad, y);
  ctx.letterSpacing = '0px';

  // Titre, réduit jusqu'à tenir sur 2 lignes
  const title = t.titleCase === 'uppercase' ? m.title.toUpperCase() : m.title;
  let size = 140, lines: string[];
  for (;;) {
    ctx.font = fontOf(t.display, t.titleWeight, size);
    lines = wrap(ctx, title, W - pad * 2);
    const fits = lines.length <= 2 && lines.every(l => ctx.measureText(l).width <= W - pad * 2);
    if (fits || size <= 64) break;
    size -= 6;
  }
  ctx.fillStyle = t.fg;
  y += 20;
  for (const l of lines) {
    y += size * 0.98;
    ctx.fillText(l, pad, y);
  }

  // Séance
  y += 230;
  ctx.font = fontOf(t.fx === 'auto' ? "'Inter'" : t.mono, t.fx === 'auto' ? 900 : 700, 210);
  ctx.fillStyle = t.accent;
  ctx.fillText(s.time.replace(':', 'h'), pad - 6, y);

  y += 95;
  ctx.font = fontOf("'Inter'", 700, 48);
  ctx.fillStyle = t.fg;
  ctx.fillText(`${cinemas[s.cinema].label} · ${s.version}`, pad, y);

  // Signature
  ctx.font = fontOf("'Inter'", 900, 56);
  ctx.fillStyle = t.fg;
  ctx.globalAlpha = 0.9;
  ctx.fillText('cc Trotro', pad, H - 110);
  const w = ctx.measureText('cc Trotro').width;
  ctx.fillStyle = '#FF6B00';
  ctx.fillText('.', pad + w + 2, H - 110);
  ctx.globalAlpha = 1;

  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('toBlob'))), 'image/jpeg', 0.92));
}
