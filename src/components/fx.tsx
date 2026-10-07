import { motion, useMotionValue, useSpring, useTransform, animate, type MotionValue } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import type { Theme } from '../themes';

/* ------------------------------------------------------------------ */
/* Titres : chaque identité a sa façon d'écrire le nom du film          */
/* ------------------------------------------------------------------ */

export function Title({ text, t }: { text: string; t: Theme }) {
  const style: CSSProperties = {
    fontFamily: 'var(--display)',
    fontWeight: t.titleWeight,
    letterSpacing: t.titleTracking,
    textTransform: t.titleCase,
  };
  // Le mot le plus long doit tenir sur une ligne, quelle que soit la largeur de la police
  const longest = Math.max(...text.split(' ').map(w => w.length));
  const width = { social: 0.95, digger: 0.72, salut: 0.66, malf: 0.86, auto: 0.68 }[t.fx];
  const fit = (max: number) => `min(${max}px, ${(84 / (longest * width)).toFixed(1)}vw)`;
  const cls = 'leading-[0.95] break-words';
  style.fontSize = fit(72);

  if (t.fx === 'social') {
    // Les mots se resserrent depuis un espacement extrême, comme une mise au point
    return (
      <h1 className={cls} style={{ ...style, fontSize: fit(60) }} aria-label={text}>
        {text.split(' ').map((w, i) => (
          <motion.span
            key={i}
            className="inline-block mr-[0.3em]"
            initial={{ opacity: 0, letterSpacing: '0.9em', filter: 'blur(10px)' }}
            animate={{ opacity: 1, letterSpacing: t.titleTracking, filter: 'blur(0px)' }}
            transition={{ delay: 0.55 + i * 0.18, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden
          >
            {w}
          </motion.span>
        ))}
      </h1>
    );
  }

  if (t.fx === 'digger') {
    // Les lettres tombent et rebondissent comme des mottes de terre
    return (
      <h1 className={cls} style={{ ...style, fontSize: fit(96) }} aria-label={text}>
        {[...text].map((c, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: -320, rotate: (i % 2 ? 1 : -1) * (20 + i * 7), opacity: 0 }}
            animate={{ y: 0, rotate: (i % 3) - 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 380, damping: 13, mass: 1.2 }}
            aria-hidden
          >
            {c}
          </motion.span>
        ))}
      </h1>
    );
  }

  if (t.fx === 'salut') {
    // Lettres frappées une à une, comme sur un tampon encreur
    return (
      <h1 className={cls} style={style} aria-label={text}>
        {[...text].map((c, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, scale: 1.6 }}
            animate={{ opacity: [0, 1, 0.85, 1], scale: 1 }}
            transition={{ delay: 0.6 + i * 0.06, duration: 0.18, ease: 'easeOut' }}
            aria-hidden
          >
            {c === ' ' ? ' ' : c}
          </motion.span>
        ))}
      </h1>
    );
  }

  if (t.fx === 'malf') {
    // Apparition dans le noir avec un scintillement de bougie, jamais tout à fait stable
    return (
      <motion.h1
        className={cls}
        style={{ ...style, textShadow: '0 0 24px rgba(201,148,90,.35)' }}
        initial={{ opacity: 0, filter: 'blur(14px)', y: 10 }}
        animate={{ opacity: [0, 0.6, 0.2, 1, 0.75, 1], filter: 'blur(0px)', y: 0 }}
        transition={{
          delay: 0.7,
          opacity: { delay: 0.7, duration: 2.2, times: [0, 0.2, 0.3, 0.55, 0.7, 1] },
          filter: { delay: 0.7, duration: 1.6, ease: 'easeOut' },
          y: { delay: 0.7, duration: 1.6, ease: 'easeOut' },
        }}
      >
        <span className="flicker">{text}</span>
      </motion.h1>
    );
  }

  return (
    <h1 className={cls} style={style} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 260, damping: 26 }}
            aria-hidden
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/* ------------------------------------------------------------------ */
/* Texte machine à écrire (Notre salut, Social Reckoning)              */
/* ------------------------------------------------------------------ */

export function Typewriter({ text, delay = 0, speed = 14, caret = true }: { text: string; delay?: number; speed?: number; caret?: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let id: number;
    const start = setTimeout(() => {
      id = window.setInterval(() => setN(v => (v >= text.length ? (clearInterval(id), v) : v + 1)), speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [text, delay, speed]);
  return (
    <span aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      {caret && n < text.length && <span className="caret" aria-hidden>▍</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Calques au-dessus de l'affiche                                      */
/* ------------------------------------------------------------------ */

// The Social Reckoning : l'affiche se scinde en triptyque, chaque panneau défile à sa vitesse
export function Triptych({ src, scrollY }: { src: string; scrollY: MotionValue<number> }) {
  const speeds = [0.22, -0.12, 0.34];
  return (
    <div className="absolute inset-0 flex gap-[3px] bg-[var(--bg)]">
      {speeds.map((k, i) => (
        <Panel key={i} i={i} k={k} src={src} scrollY={scrollY} />
      ))}
    </div>
  );
}

function Panel({ i, k, src, scrollY }: { i: number; k: number; src: string; scrollY: MotionValue<number> }) {
  const y = useTransform(scrollY, [0, 600], [0, 600 * k]);
  return (
    <motion.div
      className="relative flex-1 overflow-hidden"
      initial={{ y: i % 2 ? 80 : -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 + i * 0.12, duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={src}
        alt=""
        style={{ y, left: `${-i * 100}%` }}
        className="absolute top-0 h-full w-[300%] max-w-none object-cover"
      />
    </motion.div>
  );
}

// Malfaisante : obscurité totale, seule une lumière suit le doigt
export function Spotlight() {
  const mx = useMotionValue(55);
  const my = useMotionValue(38);
  const x = useSpring(mx, { stiffness: 60, damping: 18 });
  const y = useSpring(my, { stiffness: 60, damping: 18 });
  const bg = useTransform(
    [x, y],
    ([a, b]) => `radial-gradient(circle at ${a}% ${b}%, transparent 0, rgba(5,4,3,.55) 110px, rgba(5,4,3,.97) 230px)`,
  );

  useEffect(() => {
    // Tant que personne ne touche l'écran, la lumière erre seule
    let touched = false;
    const wander = animate(mx, [55, 30, 70, 45, 55], { duration: 9, repeat: Infinity, ease: 'easeInOut' });
    const wanderY = animate(my, [38, 25, 50, 30, 38], { duration: 7, repeat: Infinity, ease: 'easeInOut' });
    const onMove = (e: PointerEvent) => {
      const host = document.querySelector('[data-hero]')?.getBoundingClientRect();
      if (!host) return;
      if (!touched) {
        touched = true;
        wander.stop();
        wanderY.stop();
      }
      mx.set(((e.clientX - host.left) / host.width) * 100);
      my.set(((e.clientY - host.top) / host.height) * 100);
    };
    addEventListener('pointermove', onMove);
    addEventListener('pointerdown', onMove);
    return () => {
      wander.stop();
      wanderY.stop();
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onMove);
    };
  }, [mx, my]);

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ background: bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 1.4 }}
    />
  );
}

// Digger : la mer tourbillonnante de l'affiche, en couches qui dérivent
export function Waves() {
  const layers = [
    { c: '#2b4f4c', d: 0, dur: 18, o: 1 },
    { c: '#3d6662', d: 18, dur: 13, o: 0.9 },
    { c: '#8fae9f', d: 36, dur: 10, o: 0.55 },
    { c: '#f3ead2', d: 52, dur: 8, o: 0.18 },
  ];
  const path = (amp: number) =>
    `M0 ${40} ` + Array.from({ length: 8 }, (_, i) => `Q ${i * 100 + 50} ${40 - amp * (i % 2 ? -1 : 1)} ${(i + 1) * 100} 40`).join(' ') + ' V200 H0 Z';
  return (
    <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden pointer-events-none" aria-hidden>
      {layers.map((l, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          className="absolute left-0 w-[200%] h-full"
          style={{ top: l.d, opacity: l.o }}
          initial={{ x: '0%' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: l.dur, repeat: Infinity, ease: 'linear' }}
        >
          <path d={path(14 + i * 4)} fill={l.c} />
        </motion.svg>
      ))}
    </div>
  );
}

// Notre salut : grain de pellicule + vignette sur toute la page
export function Grain() {
  return (
    <>
      <div className="grain fixed inset-[-50%] pointer-events-none z-[60] opacity-[.22] mix-blend-multiply" aria-hidden />
      <div className="fixed inset-0 pointer-events-none z-[59] shadow-[inset_0_0_140px_rgba(40,30,15,.45)]" aria-hidden />
    </>
  );
}

export function Tricolore() {
  return (
    <div className="flex h-1.5 w-full overflow-hidden" aria-hidden>
      {['#1c2f6b', '#f4efe2', '#b3262c'].map((c, i) => (
        <motion.span
          key={c}
          className="flex-1 origin-left"
          style={{ background: c }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9 + i * 0.22, duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
