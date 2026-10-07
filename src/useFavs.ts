import { useCallback, useState } from 'react';
import { validIds } from './data';
import { haptic } from './transition';

const readUrl = () => {
  try {
    const p = new URLSearchParams(location.search).get('favs');
    return new Set(p ? p.split(',').filter(id => validIds.has(id)) : []);
  } catch {
    return new Set<string>();
  }
};

export function writeUrl(favs: Set<string>, film: string | null, push = false) {
  const q = new URLSearchParams();
  if (film) q.set('film', film);
  if (favs.size) q.set('favs', [...favs].join(','));
  const url = location.pathname + (q.size ? `?${q.toString().replace(/%2C/g, ',')}` : '');
  history[push ? 'pushState' : 'replaceState']({ film }, '', url);
}

export function useFavs() {
  const [favs, setFavs] = useState(readUrl);

  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        haptic(8);
      } else {
        next.add(id);
        haptic([10, 40, 18]);
      }
      writeUrl(next, new URLSearchParams(location.search).get('film'));
      return next;
    });
  }, []);

  return { favs, toggle };
}
