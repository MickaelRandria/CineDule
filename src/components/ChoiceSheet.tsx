import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cinemas, dateLabel, posterAt, sessionId, type Movie, type Session } from '../data';
import type { Theme } from '../themes';
import { storyImage } from '../story';
import { haptic } from '../transition';

const INSTAGRAM = 'mickarandria';
const EASE = [0.16, 1, 0.3, 1] as const;

export const choiceLink = (s: Session) => {
  const u = new URL(location.origin + location.pathname);
  u.searchParams.set('film', s.movieId);
  u.searchParams.set('choix', sessionId(s));
  return u.toString();
};

const messageFor = (m: Movie, s: Session) =>
  `Mon choix pour vendredi soir : ${m.title}, ${s.time.replace(':', 'h')} à l'${cinemas[s.cinema].label} (${s.version}).\n${choiceLink(s)}`;

// Le navigateur intégré d'Instagram ne garantit pas l'API presse-papiers : repli sur execCommand
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.append(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

type Props = { movie: Movie; session: Session | null; theme: Theme; onClose: () => void };

export function ChoiceSheet({ movie: m, session: s, theme: t, onClose }: Props) {
  const [step, setStep] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [story, setStory] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!s) {
      setStep('idle');
      setStory(null);
      return;
    }
    haptic([10, 50, 20]);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [s, onClose]);

  const sendInsta = async () => {
    if (!s) return;
    const ok = await copy(messageFor(m, s));
    setStep(ok ? 'copied' : 'failed');
    haptic(15);
    // Laisse le temps de lire la consigne avant de basculer sur Instagram
    setTimeout(() => (location.href = `https://ig.me/m/${INSTAGRAM}`), ok ? 1100 : 2200);
  };

  const shareStory = async () => {
    if (!s || busy) return;
    setBusy(true);
    try {
      const blob = await storyImage(m, s, t);
      const file = new File([blob], `cinedule-${m.title.toLowerCase().replace(/\W+/g, '-')}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Repli : on affiche l'image, un appui long permet de l'enregistrer
        setStory(URL.createObjectURL(blob));
      }
    } catch {
      /* partage annulé */
    } finally {
      setBusy(false);
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
              onClick={sendInsta}
              whileTap={{ scale: 0.97 }}
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-[15px] font-bold"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={step} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {step === 'idle' && 'Envoyer à Micka sur Insta'}
                  {step === 'copied' && 'Message copié — colle-le !'}
                  {step === 'failed' && 'Ouverture d’Instagram…'}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <p className="mt-2.5 text-center text-[12px]" style={{ color: 'var(--muted)' }}>
              {step === 'failed'
                ? 'Copie impossible ici : écris-lui le film et l’horaire.'
                : 'Le message est copié, la conversation s’ouvre : tu n’as plus qu’à coller.'}
            </p>

            <div className="mt-5 flex items-center justify-between text-[13px] font-semibold">
              <button onClick={shareStory} className="underline underline-offset-4 decoration-1" style={{ textDecorationColor: 'var(--accent)' }}>
                {busy ? 'Préparation…' : 'Image pour la story'}
              </button>
              <button onClick={onClose} style={{ color: 'var(--muted)' }}>
                Changer d’avis
              </button>
            </div>

          </motion.div>
            <AnimatePresence>
              {story && (
                <motion.div
                  className="fixed inset-0 z-[75] flex flex-col items-center justify-center gap-4 bg-black/90 p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setStory(null)}
                >
                  <img src={story} alt={`Story : ${m.title} ${s.time}`} className="max-h-[78vh] rounded-xl" />
                  <p className="text-center text-[13px] font-semibold text-white/80">Appuie longuement sur l’image pour l’enregistrer</p>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
