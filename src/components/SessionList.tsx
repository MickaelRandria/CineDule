import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useRef } from 'react';
import { cinemas, isFavTime, movieById, posterAt, runtime, sessionId, type Session } from '../data';
import { FavIcon } from './FavIcon';

type Props = {
  list: Session[];
  favs: Set<string>;
  toggle: (id: string) => void;
  onOpen: (id: string, pt: { x: number; y: number }, posterEl: HTMLElement | null) => void;
  now: string | null;
  empty: string;
};

export function SessionList({ list, favs, toggle, onOpen, now, empty }: Props) {
  if (!list.length) {
    return (
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 px-8 text-stone-400 font-bold text-xl">
        {empty}
      </motion.p>
    );
  }

  // Regroupement par heure, avec des en-têtes collants
  const groups = new Map<string, Session[]>();
  for (const s of list) {
    const h = s.time.slice(0, 2);
    groups.set(h, [...(groups.get(h) ?? []), s]);
  }

  let nowShown = false;
  let i = 0;
  return (
    <main className="pb-28">
      {[...groups].map(([h, items]) => (
        <section key={h}>
          <h3 className="hour-head sticky z-10 px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-stone-400 bg-[#EBEBE6]/95">
            {Number(h)}h
          </h3>
          {items.map(s => {
            const showNow = now && !nowShown && s.time >= now;
            if (showNow) nowShown = true;
            const id = sessionId(s);
            return (
              <div key={id}>
                {showNow && <NowLine now={now!} />}
                <Row s={s} on={favs.has(id)} toggle={() => toggle(id)} onOpen={onOpen} index={i++} />
              </div>
            );
          })}
        </section>
      ))}
    </main>
  );
}

function NowLine({ now }: { now: string }) {
  return (
    <div className="relative flex items-center gap-2 px-5 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6B00] opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF6B00]" />
      </span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6B00]">Maintenant · {now.replace(':', 'h')}</span>
      <span className="h-px flex-1 bg-[#FF6B00]" />
    </div>
  );
}

const SWIPE = 90;

function Row({ s, on, toggle, onOpen, index }: { s: Session; on: boolean; toggle: () => void; onOpen: Props['onOpen']; index: number }) {
  const m = movieById.get(s.movieId)!;
  const x = useMotionValue(0);
  const reveal = useTransform(x, [0, SWIPE], [0, 1]);
  const heartScale = useTransform(x, [0, SWIPE, SWIPE * 1.6], [0.4, 1.15, 1.3]);
  const posterRef = useRef<HTMLImageElement>(null);
  const dragged = useRef(false);
  const fav = isFavTime(s.time);

  return (
    <div className="row-in relative overflow-hidden border-b border-stone-300/60">
      {/* Fond révélé par le glissement */}
      <motion.div style={{ opacity: reveal }} className="absolute inset-0 flex items-center pl-6 bg-[#FF6B00] text-white">
        <motion.span style={{ scale: heartScale }} className="flex items-center gap-2 font-black uppercase tracking-wider text-sm">
          <FavIcon kind="heart" on={false} size={26} />
          {on ? 'Retirer' : 'Ajouter'}
        </motion.span>
      </motion.div>

      <motion.article
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.55 }}
        style={{ x }}
        onPointerDown={() => (dragged.current = false)}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE) toggle();
          animate(x, 0, { type: 'spring', stiffness: 600, damping: 40 });
        }}
        onTap={e => {
          const pe = e as PointerEvent;
          if (dragged.current || (pe.target as HTMLElement).closest('[data-fav]')) return;
          onOpen(s.movieId, { x: pe.clientX, y: pe.clientY }, posterRef.current);
        }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index, 10) * 0.035, type: 'spring', stiffness: 400, damping: 34 }}
        className={`relative flex flex-col py-5 px-5 bg-[#EBEBE6] cursor-pointer touch-pan-y ${on ? 'shadow-[inset_4px_0_0_#FF6B00]' : ''}`}
      >
        {m.poster && (
          <div className="absolute inset-y-0 right-0 w-2/5 pointer-events-none" aria-hidden>
            <img ref={posterRef} src={posterAt(m.poster, 300)} alt="" loading="lazy" className="h-full w-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#EBEBE6] via-[#EBEBE6]/70 to-[#EBEBE6]/10" />
          </div>
        )}

        <div className="absolute top-6 right-4 flex flex-col items-end gap-2 z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0D1F4C] text-white">
            {cinemas[s.cinema]?.short}
          </span>
          <button
            data-fav
            onClick={toggle}
            aria-label={on ? 'Retirer de ma sélection' : 'Ajouter à ma sélection'}
            className={`p-1 -m-1 ${on ? '' : 'text-stone-400'}`}
            style={{ ['--accent' as string]: '#FF6B00' }}
          >
            <FavIcon kind="heart" on={on} size={22} />
          </button>
        </div>

        <span className={`text-[64px] font-black tracking-[-0.05em] leading-none mb-2 ${fav ? 'text-[#FF6B00]' : 'text-black'}`}>
          {s.time.replace(':', 'h')}
        </span>
        <div className="pr-24 relative">
          <h2 className="text-xl font-bold uppercase tracking-tight leading-tight">{m.title}</h2>
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            <span className="text-sm font-bold text-stone-500">{runtime(m.runtime)}</span>
            <span className="bg-stone-200/80 px-2 py-0.5 rounded text-xs font-extrabold text-stone-600">{s.version}</span>
            {s.preview && <span className="bg-black text-[#FF6B00] px-2 py-0.5 rounded text-xs font-extrabold tracking-wider">AVANT-PREM</span>}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
