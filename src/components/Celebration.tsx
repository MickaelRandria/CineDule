import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DATE } from '../data';
import { haptic } from '../transition';

const EASE = [0.16, 1, 0.3, 1] as const;
const PAPER = ['#FF6B00', '#FF6B00', '#EBEBE6', '#EBEBE6', '#8a8a85'];
const stamp = DATE.split('-').reverse().map(p => p.slice(-2)).join('.');

// Fines bandes de papier qui jaillissent puis flottent en retombant, palette réduite à celle de l'app
function Confetti({ n = 56 }: { n?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
        const v = 140 + Math.random() * 220;
        return {
          i,
          x: Math.cos(a) * v,
          y: Math.sin(a) * v,
          drift: (Math.random() - 0.5) * 80,
          fall: 380 + Math.random() * 260,
          w: 3 + Math.random() * 3,
          h: 12 + Math.random() * 10,
          spin: 360 + Math.random() * 720,
          color: PAPER[i % PAPER.length],
          delay: 0.18 + Math.random() * 0.1,
          dur: 2.4 + Math.random() * 1.2,
        };
      }),
    [n],
  );
  return (
    <div className="pointer-events-none fixed left-1/2 top-[42%] z-[81]" style={{ perspective: 600 }} aria-hidden>
      {parts.map(p => (
        <motion.span
          key={p.i}
          className="absolute"
          style={{ width: p.w, height: p.h, marginLeft: -p.w / 2, marginTop: -p.h / 2, background: p.color }}
          initial={{ x: 0, y: 0, rotateX: 0, rotateZ: 0, opacity: 0 }}
          animate={{
            x: [0, p.x, p.x + p.drift],
            y: [0, p.y, p.y + p.fall],
            rotateX: p.spin,
            rotateZ: p.spin / 3,
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: p.dur, delay: p.delay, times: [0, 0.18, 1], ease: [EASE, 'linear'], opacity: { duration: p.dur, delay: p.delay, times: [0, 0.05, 0.75, 1] } }}
        />
      ))}
    </div>
  );
}

// Révélation d'une ligne par masque, comme un générique
function Line({ children, delay, className = '' }: { children: ReactNode; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        exit={{ y: '-105%', transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } }}
        transition={{ delay, duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Celebration({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    haptic([12, 80, 24]);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Portail : l'en-tête est transformé au scroll, ce qui casserait le position: fixed
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center" exit={{ transition: { duration: 0.6 } }}>
          <motion.button
            aria-label="Fermer"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.2, duration: 0.4 } }}
            transition={{ duration: 0.5 }}
          />

          <Confetti />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Félicitations pour la réconciliation"
            className="relative z-[82] m-3 w-full max-w-md overflow-hidden rounded-[6px] bg-[#0b0b0a] px-7 pt-7 pb-8 text-[#EBEBE6]"
            initial={{ clipPath: 'inset(100% 0 0 0)', y: 40 }}
            animate={{ clipPath: 'inset(0% 0 0 0)', y: 0 }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { delay: 0.15, duration: 0.5, ease: [0.7, 0, 0.84, 0] } }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.28em]">
              <Line delay={0.35} className="text-[#FF6B00]">{stamp}</Line>
              <motion.button
                onClick={onClose}
                className="-m-2 p-2 text-[#EBEBE6]/60 hover:text-[#EBEBE6] transition-colors"
                aria-label="Fermer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                autoFocus
              >
                <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l12 12M14 2L2 14" /></svg>
              </motion.button>
            </div>

            <motion.div
              className="mt-8 h-px origin-left bg-[#EBEBE6]/20"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 1.1, ease: EASE }}
            />

            <h2 className="mt-8 text-[min(58px,9.6vw)] font-black leading-[0.92] tracking-[-0.055em]">
              <Line delay={0.45}>Félicitations</Line>
              <Line delay={0.55} className="font-extralight tracking-[-0.03em] text-[#EBEBE6]/70">pour la</Line>
              <Line delay={0.65}>
                réconciliation<span className="text-[#FF6B00]">.</span>
              </Line>
            </h2>

            <div className="mt-10 flex items-end justify-between">
              <Line delay={0.9} className="text-[13px] font-medium text-[#EBEBE6]/50">— cc Trotro</Line>
              <motion.button
                onClick={onClose}
                className="group relative text-[13px] font-bold uppercase tracking-[0.2em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Fermer
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-100 bg-[#FF6B00] transition-transform duration-500 group-hover:origin-left group-active:scale-x-0" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
