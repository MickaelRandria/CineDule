import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { FavKind } from '../themes';

type Props = { kind: FavKind; on: boolean; size?: number };

const pop = { scale: [1, 1.45, 0.9, 1], transition: { duration: 0.45 } };

export function FavIcon({ kind, on, size = 24 }: Props) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      {kind === 'heart' && <Heart on={on} size={size} />}
      {kind === 'like' && <Like on={on} size={size} />}
      {kind === 'stamp' && <Stamp on={on} size={size} />}
      {kind === 'shovel' && <Shovel on={on} size={size} />}
      {kind === 'tear' && <Tear on={on} size={size} />}
    </span>
  );
}

function Burst({ on, color, n = 8, spread = 22, gravity = 0 }: { on: boolean; color: string; n?: number; spread?: number; gravity?: number }) {
  const parts = useMemo(
    () => Array.from({ length: n }, (_, i) => ({
      a: (i / n) * Math.PI * 2 + Math.random() * 0.4,
      d: spread * (0.7 + Math.random() * 0.6),
    })),
    [n, spread],
  );
  return (
    <AnimatePresence>
      {on &&
        parts.map(({ a, d }, i) => {
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
              style={{ width: 4, height: 4, marginLeft: -2, marginTop: -2, background: color }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(a) * d,
                y: [0, Math.sin(a) * d, Math.sin(a) * d + gravity],
                opacity: 0,
                scale: 0.3,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 + gravity / 100, ease: 'easeOut' }}
            />
          );
        })}
    </AnimatePresence>
  );
}

function Heart({ on, size }: { on: boolean; size: number }) {
  return (
    <>
      <motion.svg
        width={size} height={size} viewBox="0 0 24 24"
        animate={on ? pop : { scale: 1 }}
        fill={on ? 'var(--accent)' : 'none'} stroke={on ? 'var(--accent)' : 'currentColor'}
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </motion.svg>
      <Burst on={on} color="var(--accent)" />
    </>
  );
}

function Like({ on, size }: { on: boolean; size: number }) {
  return (
    <>
      <motion.svg
        width={size} height={size} viewBox="0 0 24 24"
        animate={on ? { rotate: [0, -22, 8, 0], y: [0, -4, 0], transition: { duration: 0.5 } } : { rotate: 0 }}
        fill={on ? 'var(--accent)' : 'none'} stroke={on ? 'var(--accent)' : 'currentColor'}
        strokeWidth="1.8" strokeLinejoin="round"
      >
        <path d="M7 10v11H3V10h4zm2 11h8.6a2 2 0 0 0 2-1.6l1.3-7A2 2 0 0 0 19 10h-5.2l.8-4.1A1.8 1.8 0 0 0 12.9 4L9 10v11z" />
      </motion.svg>
      <AnimatePresence>
        {on && (
          <motion.span
            className="absolute -top-1 left-full ml-0.5 text-[11px] font-bold pointer-events-none"
            style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: -14, opacity: [0, 1, 1, 0], transition: { duration: 1 } }}
            exit={{ opacity: 0 }}
          >
            +1
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}

function Stamp({ on, size }: { on: boolean; size: number }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {on ? (
        <motion.span
          key="on"
          className="grid place-items-center border-2 rounded-[3px] font-bold uppercase leading-none"
          style={{
            width: size * 1.9, height: size, fontSize: size * 0.42, color: 'var(--accent)',
            borderColor: 'var(--accent)', fontFamily: 'var(--mono)', mixBlendMode: 'multiply',
          }}
          initial={{ scale: 2.6, rotate: -4, opacity: 0 }}
          animate={{ scale: 1, rotate: -12, opacity: 0.9 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 700, damping: 26 }}
        >
          Visé
        </motion.span>
      ) : (
        <motion.span
          key="off"
          className="grid place-items-center border border-dashed rounded-[3px] uppercase leading-none opacity-50"
          style={{ width: size * 1.9, height: size, fontSize: size * 0.38, fontFamily: 'var(--mono)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
        >
          Viser
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function Shovel({ on, size }: { on: boolean; size: number }) {
  return (
    <>
      <motion.svg
        width={size} height={size} viewBox="0 0 24 24"
        animate={on ? { rotate: [0, 35, -10, 20, 0], y: [0, 3, -2, 0], transition: { duration: 0.6 } } : { rotate: 0 }}
        style={{ originX: 0.8, originY: 0.2 }}
        fill="none" stroke={on ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M14.5 9.5 21 3m-3 0 3 3" />
        <path d="M14.5 9.5 12 7 5.5 13.5a3.5 3.5 0 0 0 0 5L5 19l.5.5a3.5 3.5 0 0 0 5 0L17 13l-2.5-3.5z" fill={on ? 'var(--accent)' : 'none'} />
      </motion.svg>
      <Burst on={on} color="#8a6a43" n={12} spread={16} gravity={26} />
    </>
  );
}

function Tear({ on, size }: { on: boolean; size: number }) {
  return (
    <>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2.5C9 7 6 10.5 6 14.5a6 6 0 0 0 12 0C18 10.5 15 7 12 2.5z" />
        <motion.path
          d="M12 2.5C9 7 6 10.5 6 14.5a6 6 0 0 0 12 0C18 10.5 15 7 12 2.5z"
          fill="var(--accent)" stroke="var(--accent)"
          initial={false}
          animate={{ clipPath: on ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)' }}
          transition={{ duration: 0.9, ease: [0.6, 0, 0.2, 1] }}
        />
      </svg>
      <AnimatePresence>
        {on && (
          <motion.span
            className="absolute left-1/2 top-full rounded-full pointer-events-none"
            style={{ width: 3, height: 6, marginLeft: -1.5, background: 'var(--accent)' }}
            initial={{ y: -4, opacity: 0, scaleY: 0.5 }}
            animate={{ y: 26, opacity: [0, 1, 0], scaleY: 1.4 }}
            transition={{ duration: 1.1, delay: 0.7, ease: 'easeIn' }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
