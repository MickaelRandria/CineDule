import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cinemas, movieById, posterAt, runtime, sessionId, sessions } from '../data';
import { themeVars, type Theme } from '../themes';
import { FavIcon } from './FavIcon';
import { Grain, Spotlight, Title, Tricolore, Triptych, Typewriter, Waves } from './fx';

type Props = {
  movieId: string;
  theme: Theme;
  favs: Set<string>;
  toggle: (id: string) => void;
  onClose: () => void;
};

// Le rythme d'apparition du contenu change aussi selon le film
const enter = (t: Theme, i: number) => {
  const base = 0.9 + i * 0.07;
  switch (t.fx) {
    case 'digger': return { delay: base + 0.3, type: 'spring' as const, stiffness: 300, damping: 14 };
    case 'malf': return { delay: base + 0.8, duration: 1.4, ease: 'easeOut' as const };
    case 'salut': return { delay: base + 0.4, duration: 0.25, ease: 'linear' as const };
    default: return { delay: base, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const };
  }
};

export function FilmPage({ movieId, theme: t, favs, toggle, onClose }: Props) {
  const m = movieById.get(movieId)!;
  const scroller = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scroller });
  const heroY = useTransform(scrollY, [0, 700], [0, 220]);
  const heroScale = useTransform(scrollY, [-200, 0, 700], [1.25, 1, 1.08]);
  const closeBg = useTransform(scrollY, [200, 420], [0, 1]);
  const src = posterAt(m.poster, 600);

  const byCinema = Object.keys(cinemas)
    .map(code => ({ code, list: sessions.filter(s => s.movieId === movieId && s.cinema === code) }))
    .filter(g => g.list.length);

  // Malfaisante : de temps en temps, le visage se retourne une fraction de seconde
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    if (t.fx !== 'malf') return;
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 110);
    }, 5200);
    return () => clearInterval(id);
  }, [t.fx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={scroller}
      className="film fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{ ...themeVars(t), background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--body)' }}
      role="dialog"
      aria-modal="true"
      aria-label={m.title}
    >
      {t.fx === 'salut' && <Grain />}

      {/* Barre de retour */}
      <div className="sticky top-0 z-40 h-0">
        <motion.div className="absolute inset-x-0 top-0 h-16" style={{ opacity: closeBg, background: 'linear-gradient(var(--bg), transparent)' }} />
        <motion.button
          onClick={onClose}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-4 top-[max(14px,env(safe-area-inset-top))] grid h-11 w-11 place-items-center rounded-full backdrop-blur-md"
          style={{ background: 'color-mix(in srgb, var(--bg) 55%, transparent)', color: 'var(--fg)' }}
          aria-label="Retour"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </motion.button>
      </div>

      {/* Affiche en héros */}
      <section data-hero className="relative h-[78vh] overflow-hidden">
        <motion.img
          src={src}
          alt=""
          crossOrigin="anonymous"
          style={{ y: heroY, scale: heroScale, viewTransitionName: 'poster', scaleX: glitch ? -1 : 1 }}
          className={`absolute inset-0 h-full w-full object-cover ${t.fx === 'salut' ? 'salut-film' : ''}`}
        />
        {t.fx === 'social' && <Triptych src={src} scrollY={scrollY} />}
        {t.fx === 'malf' && <Spotlight />}
        <div className="absolute inset-x-0 bottom-0 h-3/4" style={{ background: 'linear-gradient(transparent, color-mix(in srgb, var(--bg) 70%, transparent) 55%, var(--bg) 88%)' }} />
        {t.fx === 'digger' && <Waves />}
      </section>

      <div className="relative -mt-28 px-5 pb-24">
        {t.fx === 'salut' && <div className="mb-4"><Tricolore /></div>}

        <Title text={m.title} t={t} />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={enter(t, 0)} className="mt-4 flex flex-wrap items-center gap-2 text-[13px]" style={{ fontFamily: 'var(--mono)' }}>
          <span className="font-bold">{runtime(m.runtime)}</span>
          {m.genres.map(g => (
            <span key={g} className="rounded px-2 py-0.5 uppercase tracking-wider text-[11px]" style={{ background: 'var(--surface)', color: 'color-mix(in srgb, var(--fg) 75%, var(--bg))' }}>{g}</span>
          ))}
        </motion.div>

        {t.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={enter(t, 1)}
            className="mt-6 text-[19px] leading-snug"
            style={{
              fontFamily: t.fx === 'digger' ? 'var(--mono)' : 'var(--display)',
              color: 'var(--accent)',
              letterSpacing: t.fx === 'social' ? '0.12em' : undefined,
              textTransform: t.fx === 'social' ? 'uppercase' : undefined,
              fontStyle: t.fx === 'malf' ? 'italic' : undefined,
            }}
          >
            {t.fx === 'social' ? <Typewriter text={t.tagline} delay={1500} speed={38} /> : t.tagline}
          </motion.p>
        )}

        {m.synopsis && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(t, 2)}
            className="mt-5 leading-relaxed"
            style={{ color: 'color-mix(in srgb, var(--fg) 80%, var(--bg))', fontSize: t.fx === 'malf' ? 20 : 16 }}
          >
            {t.fx === 'salut' ? <Typewriter text={m.synopsis} delay={1500} speed={11} /> : m.synopsis}
          </motion.p>
        )}

        {/* Séances par cinéma */}
        <div className="mt-10 space-y-8">
          {byCinema.map(({ code, list }, gi) => (
            <motion.section key={code} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={enter(t, 3 + gi)}>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {cinemas[code].label}
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {list.map(s => {
                  const id = sessionId(s);
                  const on = favs.has(id);
                  return (
                    <motion.div
                      key={id}
                      layout
                      className="relative rounded-2xl p-3.5 transition-colors"
                      style={{
                        background: on ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'var(--surface)',
                        boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'none',
                      }}
                    >
                      <button onClick={() => toggle(id)} className="block w-full text-left" aria-pressed={on} aria-label={`${s.time} ${s.version} — ${on ? t.favLabel[1] : t.favLabel[0]}`}>
                        <span className="block pr-8 leading-none" style={{ fontFamily: t.fx === 'auto' ? 'var(--display)' : 'var(--mono)', fontSize: t.fx === 'auto' ? 34 : 28, fontWeight: t.fx === 'auto' ? 900 : 700, letterSpacing: '-0.03em' }}>
                          {s.time.replace(':', 'h')}
                        </span>
                        <span className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                            {s.version}{s.preview ? ' · AVP' : ''}
                          </span>
                          <span style={{ color: on ? 'var(--accent)' : 'var(--muted)' }}>
                            <FavIcon kind={t.fav} on={on} size={20} />
                          </span>
                        </span>
                      </button>
                      {s.ticket && (
                        <a
                          href={s.ticket}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full"
                          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
                          aria-label={`Réserver ${s.time} chez ${cinemas[code].label}`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
                        </a>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
