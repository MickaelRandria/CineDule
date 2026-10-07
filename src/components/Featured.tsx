import type { MouseEvent } from 'react';
import { FEATURED, movieById, movies, posterAt, sessions } from '../data';
import { SIGNATURE, themeVars } from '../themes';

export type OpenFilm = (id: string, e: MouseEvent, posterEl: HTMLElement | null) => void;

const count = (id: string) => sessions.filter(s => s.movieId === id).length;

const posterOf = (e: MouseEvent) =>
  (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-poster]');

export function Featured({ onOpen }: { onOpen: OpenFilm }) {
  return (
    <section aria-label="Le film de vendredi soir" className="pb-4">
      <div className="px-5 mb-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-stone-500">
          Ton choix · {FEATURED.length} films
        </p>
        <h2 className="mt-1 text-[28px] font-black tracking-[-0.04em] leading-none">
          Quel film vendredi soir<span className="text-[#FF6B00]">&nbsp;?</span>
        </h2>
      </div>
      <div className="deck flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-5 pb-6 pt-2">
        {FEATURED.map((id, i) => {
          const m = movieById.get(id)!;
          const t = SIGNATURE[id];
          return (
            <button
              key={id}
              onClick={e => onOpen(id, e, posterOf(e))}
              className="deck-card group relative shrink-0 snap-center w-[68vw] max-w-[300px] aspect-[2/3] rounded-[22px] overflow-hidden text-left shadow-[0_24px_50px_-18px_rgba(0,0,0,.55)] active:scale-[.97] transition-transform"
              style={{ ...themeVars(t), animationDelay: `${300 + i * 90}ms` }}
            >
              <img
                data-poster
                src={posterAt(m.poster, 600)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4" style={{ color: 'var(--fg)' }}>
                <p
                  className="text-[26px] leading-[1.02]"
                  style={{
                    fontFamily: 'var(--display)',
                    fontWeight: t.titleWeight,
                    letterSpacing: t.titleTracking,
                    textTransform: t.titleCase,
                  }}
                >
                  {m.title}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] opacity-75" style={{ fontFamily: 'var(--mono)' }}>
                  {count(id)} séances · {m.genres[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <h2 className="px-5 mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-stone-500">
        Les autres films · {movies.length - FEATURED.length}
      </h2>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 pb-2">
        {[...movies]
          .filter(m => !FEATURED.includes(m.id))
          .sort((a, b) => count(b.id) - count(a.id))
          .map(m => (
            <button
              key={m.id}
              onClick={e => onOpen(m.id, e, posterOf(e))}
              className="shrink-0 w-[84px] text-left active:scale-95 transition-transform"
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-stone-300">
                {m.poster && (
                  <img data-poster src={posterAt(m.poster, 200)} alt="" loading="lazy" className="h-full w-full object-cover" crossOrigin="anonymous" />
                )}
              </div>
              <p className="mt-1.5 text-[11px] font-bold leading-tight line-clamp-2">{m.title}</p>
            </button>
          ))}
      </div>
    </section>
  );
}
