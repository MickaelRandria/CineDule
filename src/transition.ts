import { flushSync } from 'react-dom';

export type Origin = { x: number; y: number; el: HTMLElement | null };

const EASE = 'cubic-bezier(.76,0,.24,1)';
const DURATION = 750;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Ouverture « iris » façon cinéma muet : la nouvelle vue apparaît dans un cercle
 * qui part du doigt, pendant que l'affiche touchée vole jusqu'à sa place
 * (élément partagé `view-transition-name: poster`).
 */
export function iris(dir: 'open' | 'close', origin: Origin, update: () => void) {
  if (!document.startViewTransition || reduced()) {
    flushSync(update);
    return;
  }
  const root = document.documentElement;
  const { x, y, el } = origin;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  root.dataset.vt = dir;
  if (dir === 'open' && el) el.style.viewTransitionName = 'poster';

  const t = document.startViewTransition(() => {
    if (dir === 'open' && el) el.style.viewTransitionName = '';
    flushSync(update);
    if (dir === 'close' && el?.isConnected) el.style.viewTransitionName = 'poster';
  });

  t.ready.then(() => {
    const frames = [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`];
    root.animate(
      { clipPath: dir === 'open' ? frames : frames.reverse() },
      {
        duration: DURATION,
        easing: EASE,
        pseudoElement: dir === 'open' ? '::view-transition-new(root)' : '::view-transition-old(root)',
      },
    );
  }).catch(() => {});

  t.finished.finally(() => {
    delete root.dataset.vt;
    if (el) el.style.viewTransitionName = '';
  });
}

export const haptic = (ms: number | number[] = 12) => {
  try { navigator.vibrate?.(ms); } catch { /* iOS ne vibre pas */ }
};
