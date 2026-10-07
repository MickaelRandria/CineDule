import raw from './data/seances-2026-10-09.json';

export type Movie = {
  id: string;
  title: string;
  originalTitle: string | null;
  runtime: string | null;
  genres: string[];
  synopsis: string | null;
  poster: string | null;
};

export type Session = {
  movieId: string;
  cinema: string;
  time: string;
  version: 'VF' | 'VO' | 'VOSTFR';
  experience: string[] | null;
  preview: boolean;
  ticket: string | null;
};

export const DATE = raw.date;
export const movies: Movie[] = raw.movies;
export const sessions = raw.sessions as Session[];
export const movieById = new Map(movies.map(m => [m.id, m]));

export const cinemas: Record<string, { label: string; short: string }> = {
  P0087: { label: 'UGC Gambetta', short: 'Gambetta' },
  W3330: { label: 'UGC Bassin à flot', short: 'Bassin à flot' },
  P0425: { label: 'UGC Talence', short: 'Talence' },
};

// Les 4 films mis en avant, chacun avec son identité visuelle propre.
export const FEATURED = ['1000026649', '1000007388', '327174', '1000023068'];

export const sessionId = (s: Session) => `${s.movieId}-${s.cinema}-${s.time.replace(':', '')}`;
export const validIds = new Set(sessions.map(sessionId));

export const runtime = (r: string | null) => (r ? r.replace(/^0h /, '').replace(' ', '').replace('min', '') : '');

export const isFavTime = (t: string) => t >= '15:00' && t <= '16:30';

// AlloCiné sert des affiches redimensionnées via le préfixe /r_W_H/.
export const posterAt = (url: string | null, w: number) =>
  url ? url.replace('acsta.net/img/', `acsta.net/r_${w}_${Math.round(w * 1.5)}/img/`) : '';

export const dateLabel = new Date(DATE + 'T12:00:00').toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
