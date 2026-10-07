import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { dateLabel } from '../data';
import { Celebration } from './Celebration';

const TITLE = 'cc Trotro';

// Chaque lettre passe de la graisse 100 à 900 (police variable Inter),
// puis tout l'en-tête se compresse au scroll (animation pilotée par le scroll, CSS pur).
// Tant que le message n'a pas été ouvert, trois signaux invitent à toucher le titre :
// un reflet qui le balaie, le point orange qui sautille, et une mention discrète.
export function Header() {
  const [day, ...rest] = dateLabel.split(' ');
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const show = () => {
    setOpen(true);
    setSeen(true);
  };

  return (
    <header className="header-scroll px-5 pt-14 pb-6">
      <p className="date-in mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
        {day} <span className="text-black">{rest.join(' ')}</span>
      </p>
      <motion.button
        onClick={show}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative block origin-bottom-left text-left text-[clamp(64px,19vw,120px)] font-black tracking-[-0.05em] leading-[0.85]"
        aria-label={`${TITLE} — ouvrir le message`}
      >
        {[...TITLE].map((c, i) => (
          <span key={i} className="weight-in inline-block" style={{ animationDelay: `${120 + i * 55}ms` }} aria-hidden>
            {c === ' ' ? ' ' : c}
          </span>
        ))}

        {/* Reflet : copie du titre peinte par un dégradé qui traverse les lettres */}
        {!seen && (
          <span className="title-sheen pointer-events-none absolute inset-0 whitespace-nowrap" aria-hidden>
            {TITLE.replace(' ', ' ')}
          </span>
        )}

        <motion.span
          className="inline-block text-[#FF6B00]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.75, type: 'spring', stiffness: 400, damping: 18 }}
          aria-hidden
        >
          <motion.span
            className="inline-block"
            animate={
              seen
                ? { opacity: [1, 0.35, 1], y: 0 }
                : { opacity: 1, y: ['0em', '-0.16em', '0em', '-0.06em', '0em'] }
            }
            transition={
              seen
                ? { duration: 2.6, ease: 'easeInOut', repeat: Infinity }
                : { delay: 1.8, duration: 0.9, times: [0, 0.3, 0.6, 0.8, 1], ease: 'easeOut', repeat: Infinity, repeatDelay: 2.6 }
            }
          >
            .
          </motion.span>
        </motion.span>
      </motion.button>

      <div className="mt-2">
        <AnimatePresence>
          {!seen && (
            <motion.button
              onClick={show}
              className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF6B00]"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, transition: { duration: 0.25 } }}
              transition={{ delay: 2.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Un mot pour toi
              <motion.svg
                width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"
                animate={{ x: [0, 2, 0], y: [0, -2, 0] }}
                transition={{ delay: 3, duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              >
                <path d="M2 10 10 2M4 2h6v6" />
              </motion.svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <Celebration open={open} onClose={close} />
    </header>
  );
}
