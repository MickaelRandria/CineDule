import React, { useState, useMemo } from 'react';

const rawData = [
  {"cinema": "Talence", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "15:00"},
  {"cinema": "Talence", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "16:00"},
  {"cinema": "Talence", "movie": "Backrooms", "duration": "1h50", "format": "VO", "time": "16:30"},
  {"cinema": "Talence", "movie": "De gaulle", "duration": "2h40", "format": "WSH", "time": "15:55"},
  {"cinema": "Bassin a flot", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "15:00"},
  {"cinema": "Bassin a flot", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "16:00"},
  {"cinema": "Bassin a flot", "movie": "De gaulle", "duration": "2h40", "format": "WSH", "time": "17:00"},
  {"cinema": "Gambetta", "movie": "Toy story", "duration": "1h40", "format": "VOSTFR", "time": "14:30"},
  {"cinema": "Gambetta", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "16:00"},
  {"cinema": "Gambetta", "movie": "Backrooms", "duration": "1h50", "format": "VO", "time": "16:45"},
  {"cinema": "Gambetta", "movie": "De gaulle", "duration": "2h40", "format": "WSH", "time": "17:00"},
  {"cinema": "Megarama", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "15:30"},
  {"cinema": "Megarama", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "16:00"},
  {"cinema": "Megarama", "movie": "Backrooms", "duration": "1h50", "format": "VF", "time": "16:30"},
  {"cinema": "Megarama", "movie": "Backrooms", "duration": "1h50", "format": "VO", "time": "19:30"},
  {"cinema": "Megarama", "movie": "De gaulle", "duration": "2h40", "format": "WSH", "time": "17:15"},
  {"cinema": "CGR Français", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "15:00"},
  {"cinema": "CGR Français", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "15:40"},
  {"cinema": "CGR Français", "movie": "Backrooms", "duration": "1h50", "format": "VF", "time": "15:40"},
  {"cinema": "CGR Français", "movie": "De gaulle", "duration": "2h40", "format": "WSH", "time": "17:15"},
  {"cinema": "CGR VO", "movie": "Toy story", "duration": "1h40", "format": "ICE 9€ VF", "time": "15:15"},
  {"cinema": "CGR VO", "movie": "Toy story", "duration": "1h40", "format": "VF", "time": "15:45"},
  {"cinema": "CGR VO", "movie": "Backrooms", "duration": "1h50", "format": "VF", "time": "15:00"},
  {"cinema": "CGR VO", "movie": "De gaulle", "duration": "2h40", "format": "WSH", "time": "16:30"}
];

type Session = typeof rawData[0];

const makeSessionId = (s: Session): string =>
  `${s.cinema.replace(/\s+/g, '').slice(0, 4)}-${s.movie.replace(/\s+/g, '').slice(0, 3)}-${s.time.replace(':', '')}`;

const validIds = new Set(rawData.map(makeSessionId));

const cinemaBadge: Record<string, { label: string; className: string }> = {
  'Gambetta':      { label: 'UGC Gambetta',      className: 'bg-[#0D1F4C] text-white' },
  'Talence':       { label: 'UGC Talence',        className: 'bg-[#0D1F4C] text-white' },
  'Bassin a flot': { label: 'UGC Bassin à flot',  className: 'bg-[#0D1F4C] text-white' },
  'Megarama':      { label: 'Megarama',           className: 'bg-[#FFD600] text-black' },
  'CGR Français':  { label: 'CGR Français',       className: 'bg-[#0D1F4C] text-red-500' },
  'CGR VO':        { label: 'CGR VO',             className: 'bg-[#0D1F4C] text-red-500' },
};

const posterMap: Record<string, string> = {
  'Toy story': '/ToyStory.jpeg',
  'Backrooms': '/Backrooms.jpeg',
  'De gaulle': '/Degaulle.webp',
};

const HeartOutline = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HeartFilled = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export default function App() {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [selectedCinema, setSelectedCinema] = useState<string | null>(null);

  const cinemas = [...new Set(rawData.map(s => s.cinema))];

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('favs');
      if (!param) return new Set();
      return new Set(param.split(',').filter(id => validIds.has(id)));
    } catch {
      return new Set();
    }
  });

  const [copied, setCopied] = useState(false);

  const filters = ['Tous', 'Par Cinéma', 'VO/VOSTFR', 'Fav (15h-16h30)', 'Micka Selection'];

  const isFavTime = (time: string) => time >= "15:00" && time <= "16:30";

  const toggleFav = (id: string) => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      const newUrl = next.size > 0
        ? `${window.location.pathname}?favs=${Array.from(next).join(',')}`
        : window.location.pathname;
      window.history.pushState({}, '', newUrl);
      return next;
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without user gesture
    }
  };

  const processedData = useMemo(() => {
    let result = [...rawData];

    if (activeFilter === 'VO/VOSTFR') {
      result = result.filter(item => item.format.includes('VO'));
    } else if (activeFilter === 'Fav (15h-16h30)') {
      result = result.filter(item => isFavTime(item.time));
    } else if (activeFilter === 'Micka Selection') {
      result = result.filter(item => selectedIds.has(makeSessionId(item)));
    } else if (activeFilter === 'Par Cinéma' && selectedCinema) {
      result = result.filter(item => item.cinema === selectedCinema);
    }

    if (activeFilter === 'Par Cinéma' && !selectedCinema) {
      result.sort((a, b) => a.cinema.localeCompare(b.cinema) || a.time.localeCompare(b.time));
    } else {
      result.sort((a, b) => a.time.localeCompare(b.time));
    }

    return result;
  }, [activeFilter, selectedIds, selectedCinema]);

  return (
    <div className="min-h-[100dvh] bg-[#EBEBE6] text-black font-sans pb-24 selection:bg-[#FF6B00] selection:text-white">
      {/* En-tête ultra massive type iOS */}
      <header className="px-5 pt-12 pb-6 md:px-12 md:pt-24 md:pb-12">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-1 leading-none">cc Trotro</h1>
        <p className="text-lg md:text-2xl font-medium text-stone-500 tracking-tight">
          Bon app Papa de Marie
        </p>
      </header>

      {/* Filtres interactifs - Pilules style app native */}
      <div className="sticky top-0 bg-[#EBEBE6]/95 backdrop-blur-xl px-5 py-3 z-10 border-b border-stone-300/50">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                if (filter !== 'Par Cinéma') setSelectedCinema(null);
              }}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-black text-[#EBEBE6] shadow-md'
                  : 'bg-transparent text-stone-500 hover:text-black border border-stone-300'
              }`}
            >
              {filter}
              {filter === 'Micka Selection' && selectedIds.size > 0 && (
                <span className="ml-1.5 text-xs font-black text-[#FF6B00]">
                  {selectedIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sélecteur de cinéma — visible uniquement quand "Par Cinéma" est actif */}
        {activeFilter === 'Par Cinéma' && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 pb-1 -mx-2 px-2">
            {cinemas.map(cinema => {
              const badge = cinemaBadge[cinema];
              const isActive = selectedCinema === cinema;
              return (
                <button
                  key={cinema}
                  onClick={() => setSelectedCinema(prev => prev === cinema ? null : cinema)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded text-xs font-extrabold uppercase tracking-wider transition-all ${
                    isActive
                      ? badge?.className ?? 'bg-stone-800 text-white'
                      : 'bg-transparent border border-stone-300 text-stone-500 hover:text-black'
                  }`}
                >
                  {badge?.label ?? cinema}
                </button>
              );
            })}
          </div>
        )}

        {/* Bouton de partage */}
        <div className="flex items-center justify-between mt-2.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B00] text-white text-sm font-bold transition-all active:scale-95 hover:opacity-90"
          >
            <ShareIcon />
            {copied ? 'Lien copié !' : 'Partager ma sélection'}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {selectedIds.size} séance{selectedIds.size > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Liste des séances */}
      <main className="px-5 py-4 md:px-12 flex flex-col">
        {processedData.length > 0 ? (
          processedData.map((session, index) => {
            const id = makeSessionId(session);
            const isSelected = selectedIds.has(id);
            const isFav = isFavTime(session.time);

            const poster = posterMap[session.movie];
            const isIce = session.format.includes('ICE');

            return (
              <article
                key={`${id}-${index}`}
                className={`relative flex flex-col py-6 border-b border-stone-300/60 transition-all overflow-hidden ${
                  isSelected ? 'border-l-4 border-l-[#FF6B00] pl-3' : ''
                }`}
              >
                {/* Poster en bande sur la droite, fondu gauche→droite */}
                {poster && (
                  <div className="absolute inset-y-0 right-0 w-2/5 pointer-events-none" aria-hidden="true">
                    <img
                      src={poster}
                      alt=""
                      className="h-full w-full object-cover object-center"
                      onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#EBEBE6] via-[#EBEBE6]/70 to-[#EBEBE6]/10" />
                  </div>
                )}

                {/* Colonne droite : cinéma + cœur */}
                <div className="absolute top-8 right-0 flex flex-col items-end gap-2 z-10">
                  <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${cinemaBadge[session.cinema]?.className ?? 'bg-stone-200 text-stone-600'}`}>
                    {cinemaBadge[session.cinema]?.label ?? session.cinema}
                  </span>
                  <button
                    onClick={() => toggleFav(id)}
                    aria-label={isSelected ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    className={`transition-transform active:scale-125 ${
                      isSelected ? 'text-[#FF6B00]' : 'text-stone-300'
                    }`}
                  >
                    {isSelected ? <HeartFilled /> : <HeartOutline />}
                  </button>
                </div>

                {/* L'heure en héros */}
                <span
                  className={`text-7xl md:text-8xl font-black tracking-tighter leading-none mb-3 ${
                    isFav ? 'text-[#FF6B00]' : 'text-black'
                  }`}
                >
                  {session.time.replace(':', 'h')}
                </span>

                {/* Infos du film */}
                <div className="pr-20">
                  <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight leading-tight mb-1">
                    {session.movie}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <span className="text-sm md:text-base font-bold text-stone-500">
                      {session.duration}
                    </span>
                    {isIce ? (
                      <>
                        <span className="bg-black text-[#FF6B00] px-2 py-0.5 rounded text-xs font-extrabold tracking-wider">
                          ICE
                        </span>
                        <span className="bg-stone-200/80 px-2 py-0.5 rounded text-xs font-extrabold text-stone-600">
                          {session.format.replace('ICE ', '')}
                        </span>
                      </>
                    ) : (
                      <span className="bg-stone-200/80 px-2 py-0.5 rounded text-xs font-extrabold text-stone-600">
                        {session.format}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="text-center py-20 text-stone-400 font-bold text-xl">
            {activeFilter === 'Ma Sélection'
              ? 'Aucune séance dans ta sélection.'
              : 'Aucune séance ne correspond.'}
          </div>
        )}
      </main>
    </div>
  );
}
