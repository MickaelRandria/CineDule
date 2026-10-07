import { motion } from 'motion/react';
import { cinemas } from '../data';

export const FILTERS = ['Tous', 'Ce soir', 'Par cinéma', 'VO/VOSTFR', 'Fav (15h-16h30)', 'Micka Selection'] as const;
export type Filter = (typeof FILTERS)[number];

type Props = {
  active: Filter;
  setActive: (f: Filter) => void;
  cinema: string | null;
  setCinema: (c: string | null) => void;
  favCount: number;
  onShare: () => void;
  shared: boolean;
};

const spring = { type: 'spring', stiffness: 500, damping: 38 } as const;

export function Filters({ active, setActive, cinema, setCinema, favCount, onShare, shared }: Props) {
  return (
    <div className="sticky top-0 z-20 bg-[#EBEBE6]/85 backdrop-blur-xl border-b border-stone-300/60 px-5 py-3" id="filterbar">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => {
              setActive(f);
              if (f !== 'Par cinéma') setCinema(null);
            }}
            className={`relative whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold transition-colors ${
              active === f ? 'text-[#EBEBE6]' : 'text-stone-500'
            }`}
          >
            {active === f && (
              <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-black shadow-md" transition={spring} />
            )}
            <span className="relative">
              {f}
              {f === 'Micka Selection' && favCount > 0 && (
                <motion.span
                  key={favCount}
                  initial={{ scale: 1.8 }}
                  animate={{ scale: 1 }}
                  transition={spring}
                  className="ml-1.5 inline-block text-xs font-black text-[#FF6B00]"
                >
                  {favCount}
                </motion.span>
              )}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        initial={false}
        animate={{ height: active === 'Par cinéma' ? 'auto' : 0, opacity: active === 'Par cinéma' ? 1 : 0 }}
        transition={spring}
        className="overflow-hidden"
      >
        <div className="flex gap-2 pt-2.5">
          {Object.entries(cinemas).map(([code, c]) => (
            <button
              key={code}
              onClick={() => setCinema(cinema === code ? null : code)}
              className={`whitespace-nowrap px-3 py-1.5 rounded text-xs font-extrabold uppercase tracking-wider transition-colors ${
                cinema === code ? 'bg-[#0D1F4C] text-white' : 'border border-stone-300 text-stone-500'
              }`}
            >
              {c.short}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center justify-between mt-2.5">
        <motion.button
          onClick={onShare}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B00] text-white text-sm font-bold whitespace-nowrap"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <motion.span key={String(shared)} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {shared ? 'Lien copié !' : 'Partager ma sélection'}
          </motion.span>
        </motion.button>
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">Glisse →</span>
      </div>
    </div>
  );
}
