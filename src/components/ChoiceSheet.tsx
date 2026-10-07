import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cinemas, dateLabel, posterAt, type Movie, type Session } from '../data';
import type { Theme } from '../themes';
import { storyImage } from '../story';
import { haptic } from '../transition';

const INSTAGRAM = '@mickarandria';
const EASE = [0.16, 1, 0.3, 1] as const;

type Props = { movie: Movie; session: Session | null; theme: Theme; onClose: () => void };
type Image = { url: string; file: File };

export function ChoiceSheet({ movie: m, session: s, theme: t, onClose }: Props) {
  const [image, setImage] = useState<Image | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!s) {
      setImage(null);
      return;
    }
    haptic([10, 50, 20]);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (image ? setImage(null) : onClose());
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [s, onClose, image]);

  useEffect(() => () => { if (image) URL.revokeObjectURL(image.url); }, [image]);

  const create = async () => {
    if (!s || busy) return;
    setBusy(true);
    try {
      const blob = await storyImage(m, s, t);
      const file = new File([blob], `cinedule-${m.title.toLowerCase().replace(/\W+/g, '-')}.jpg`, { type: 'image/jpeg' });
      setImage({ url: URL.createObjectURL(blob), file });
      haptic(15);
    } finally {
      setBusy(false);
    }
  };

  // Le menu de partage natif n'existe pas partout (navigateur intégré d'Instagram notamment)
  const canShare = !!image && !!navigator.canShare?.({ files: [image.file] });
  const share = async () => {
    if (!image) return;
    try {
      await navigator.share({ files: [image.file] });
    } catch {
      /* partage annulé */
    }
  };

  return (
    <AnimatePresence>
      {s && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center" initial={{ opacity: 1 }} exit={{ opacity: 1, transition: { duration: 0.5 } }}>
          <motion.button
            aria-label="Fermer"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Choisir ${m.title} à ${s.time}`}
            className="relative w-full max-w-md rounded-t-[22px] px-6 pt-3 pb-[max(28px,env(safe-area-inset-bottom))]"
            style={{ background: 'var(--bg)', color: 'var(--fg)', boxShadow: '0 -20px 60px rgba(0,0,0,.35)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } }}
            transition={{ duration: 0.6, ease: EASE }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => i.offset.y > 120 && onClose()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full" style={{ background: 'color-mix(in srgb, var(--fg) 25%, transparent)' }} />

            <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
              Ton choix · {dateLabel}
            </p>

            <div className="mt-4 flex gap-4">
              <motion.img
                src={posterAt(m.poster, 300)}
                alt=""
                crossOrigin="anonymous"
                className="h-[132px] w-[88px] shrink-0 rounded-md object-cover"
                initial={{ rotate: -6, scale: 0.8, opacity: 0 }}
                animate={{ rotate: -3, scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
              />
              <div className="min-w-0">
                <h3
                  className="text-[26px] leading-[1] break-words"
                  style={{ fontFamily: 'var(--display)', fontWeight: t.titleWeight, letterSpacing: t.fx === 'social' ? '0.08em' : t.titleTracking, textTransform: t.titleCase }}
                >
                  {m.title}
                </h3>
                <p className="mt-3 text-[44px] leading-none" style={{ fontFamily: t.fx === 'auto' ? 'var(--display)' : 'var(--mono)', fontWeight: t.fx === 'auto' ? 900 : 700, color: 'var(--accent)' }}>
                  {s.time.replace(':', 'h')}
                </p>
                <p className="mt-2 text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>
                  {cinemas[s.cinema].label} · {s.version}
                </p>
              </div>
            </div>

            <motion.button
              onClick={create}
              whileTap={{ scale: 0.97 }}
              className="mt-7 w-full rounded-full py-4 text-[15px] font-bold"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {busy ? 'Préparation…' : 'Valider mon choix'}
            </motion.button>

            <div className="mt-4 text-center">
              <button onClick={onClose} className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>
                Changer d’avis
              </button>
            </div>
          </motion.div>

          {/* L'image du choix, à envoyer en DM */}
          <AnimatePresence>
            {image && (
              <motion.div
                className="fixed inset-0 z-[75] flex flex-col items-center justify-center gap-5 bg-black px-6 py-[max(24px,env(safe-area-inset-top))]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.img
                  src={image.url}
                  alt={`Mon choix : ${m.title}, ${s.time.replace(':', 'h')}, ${cinemas[s.cinema].label}`}
                  className="max-h-[64vh] rounded-xl shadow-2xl"
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
                <motion.div
                  className="text-center text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
                >
                  <p className="text-[17px] font-bold leading-snug">
                    Envoie cette image à <span className="text-[#FF6B00]">{INSTAGRAM}</span>
                    <br />en DM sur Insta
                  </p>
                  <p className="mt-1.5 text-[13px] text-white/60">
                    {canShare ? 'Partage-la directement, ou fais une capture d’écran.' : 'Appuie longuement dessus pour l’enregistrer, ou fais une capture d’écran.'}
                  </p>
                </motion.div>
                <div className="flex w-full max-w-xs flex-col items-center gap-3">
                  {canShare && (
                    <motion.button
                      onClick={share}
                      whileTap={{ scale: 0.97 }}
                      className="w-full rounded-full bg-white py-3.5 text-[15px] font-bold text-black"
                    >
                      Partager l’image
                    </motion.button>
                  )}
                  <button onClick={() => setImage(null)} className="text-[13px] font-semibold text-white/60">
                    Fermer l’image
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
