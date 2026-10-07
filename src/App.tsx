import { MotionConfig } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DATE, isFavTime, movieById, posterAt, sessionId, sessions } from './data';
import { BASE, SIGNATURE, autoTheme, type Theme } from './themes';
import { iris, type Origin } from './transition';
import { useFavs, writeUrl } from './useFavs';
import { Header } from './components/Header';
import { Featured } from './components/Featured';
import { Filters, type Filter } from './components/Filters';
import { SessionList } from './components/SessionList';
import { FilmPage } from './components/FilmPage';

type Open = { id: string; theme: Theme } | null;

const HOME_COLOR = '#EBEBE6';

async function themeFor(id: string): Promise<Theme> {
  if (SIGNATURE[id]) return SIGNATURE[id];
  const m = movieById.get(id)!;
  if (!m.poster) return BASE;
  // On n'attend jamais plus de 450 ms l'extraction de la palette
  return Promise.race([autoTheme(m, posterAt(m.poster, 200)), new Promise<Theme>(r => setTimeout(() => r(BASE), 450))]);
}

const setChrome = (color: string, locked: boolean) => {
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', color);
  document.documentElement.style.overflow = locked ? 'hidden' : '';
};

const nowIfToday = () => {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return today === DATE ? d.toTimeString().slice(0, 5) : null;
};

export default function App() {
  const { favs, toggle } = useFavs();
  const [filter, setFilter] = useState<Filter>('Tous');
  const [cinema, setCinema] = useState<string | null>(null);
  const [open, setOpen] = useState<Open>(null);
  const [shared, setShared] = useState(false);
  const [now, setNow] = useState(nowIfToday);
  const origin = useRef<Origin>({ x: innerWidth / 2, y: innerHeight / 2, el: null });
  const pushed = useRef(false);
  const favsRef = useRef(favs);
  favsRef.current = favs;

  useEffect(() => {
    const id = setInterval(() => setNow(nowIfToday()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Hauteur de la barre de filtres → décalage des en-têtes d'heure collants
  useLayoutEffect(() => {
    const bar = document.getElementById('filterbar')!;
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--bar-h', `${bar.offsetHeight}px`));
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  const show = useCallback(async (id: string, o: Origin, animateIt = true) => {
    const theme = await themeFor(id);
    origin.current = o;
    const update = () => {
      setOpen({ id, theme });
      setChrome(theme.bg, true);
    };
    if (animateIt) iris('open', o, update);
    else update();
  }, []);

  const hide = useCallback(() => {
    iris('close', origin.current, () => {
      setOpen(null);
      setChrome(HOME_COLOR, false);
    });
  }, []);

  const openFilm = useCallback(
    (id: string, pt: { x: number; y: number }, el: HTMLElement | null) => {
      writeUrl(favsRef.current, id, true);
      pushed.current = true;
      show(id, { ...pt, el });
    },
    [show],
  );

  const closeFilm = useCallback(() => {
    if (pushed.current) {
      history.back(); // popstate s'occupe de l'animation
    } else {
      writeUrl(favsRef.current, null);
      hide();
    }
  }, [hide]);

  // Bouton retour du téléphone + lien direct ?film=
  useEffect(() => {
    const sync = () => {
      const film = new URLSearchParams(location.search).get('film');
      if (!film) {
        pushed.current = false;
        // Le retour arrière restaure l'ancienne URL : on y remet les favoris ajoutés entre-temps
        writeUrl(favsRef.current, null);
        hide();
      } else if (movieById.has(film)) {
        show(film, { x: innerWidth / 2, y: innerHeight / 2, el: null });
      }
    };
    addEventListener('popstate', sync);
    const film = new URLSearchParams(location.search).get('film');
    if (film && movieById.has(film)) show(film, origin.current, false);
    return () => removeEventListener('popstate', sync);
  }, [show, hide]);

  const list = useMemo(() => {
    let r = sessions;
    if (filter === 'Ce soir') r = r.filter(s => s.time >= '19:00');
    else if (filter === 'VO/VOSTFR') r = r.filter(s => s.version !== 'VF');
    else if (filter === 'Fav (15h-16h30)') r = r.filter(s => isFavTime(s.time));
    else if (filter === 'Micka Selection') r = r.filter(s => favs.has(sessionId(s)));
    else if (filter === 'Par cinéma' && cinema) r = r.filter(s => s.cinema === cinema);
    return [...r].sort((a, b) => a.time.localeCompare(b.time));
  }, [filter, cinema, favs]);

  const share = async () => {
    const url = new URL(location.href);
    url.searchParams.delete('film');
    const href = url.toString().replace(/%2C/g, ',');
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: 'Ma sélection Cinédule', url: href });
      } else {
        await navigator.clipboard.writeText(href);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* partage annulé */
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-[#EBEBE6] text-black selection:bg-[#FF6B00] selection:text-white" inert={open ? true : undefined}>
        <Header />
        <Featured onOpen={(id, e, el) => openFilm(id, { x: e.clientX, y: e.clientY }, el)} />
        <Filters
          active={filter}
          setActive={setFilter}
          cinema={cinema}
          setCinema={setCinema}
          favCount={favs.size}
          onShare={share}
          shared={shared}
        />
        <SessionList
          key={filter + cinema}
          list={list}
          favs={favs}
          toggle={toggle}
          onOpen={openFilm}
          now={filter === 'Micka Selection' ? null : now}
          empty={filter === 'Micka Selection' ? 'Glisse une séance vers la droite pour la garder ici.' : 'Aucune séance ne correspond.'}
        />
      </div>
      {open && <FilmPage key={open.id} movieId={open.id} theme={open.theme} favs={favs} toggle={toggle} onClose={closeFilm} />}
    </MotionConfig>
  );
}
