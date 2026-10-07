"""Récupère les séances des UGC bordelais sur AlloCiné pour une date donnée.

Usage : python scripts/fetch-allocine.py 2026-10-09
Écrit src/data/seances-<date>.json
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

THEATERS = {
    "P0087": "UGC Ciné Cité Bordeaux",  # Gambetta
    "W3330": "UGC Ciné Cité Bassins à flot",
    "P0425": "UGC Talence",
}

UA = {"User-Agent": "Mozilla/5.0"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def version(st):
    tags = st.get("tags") or []
    if st.get("diffusionVersion") == "ORIGINAL":
        return "VOSTFR" if "Localization.Subtitle.French" in tags else "VO"
    return "VF"


def ticket_url(st):
    for t in (st.get("data") or {}).get("ticketing") or []:
        if t.get("provider") == "default" and t.get("urls"):
            return t["urls"][0]
    return None


def main(date):
    movies, sessions = {}, []
    for code, name in THEATERS.items():
        page, total = 1, 1
        while page <= total:
            d = get(f"https://www.allocine.fr/_/showtimes/theater-{code}/d-{date}/p-{page}/")
            total = int(d["pagination"]["totalPages"])
            for r in d["results"]:
                m = r["movie"]
                mid = str(m["internalId"])
                movies.setdefault(mid, {
                    "id": mid,
                    "title": m["title"],
                    "originalTitle": m.get("originalTitle"),
                    "runtime": m.get("runtime"),
                    "genres": [g["translate"] for g in m.get("genres") or []],
                    "synopsis": m.get("synopsis"),
                    "poster": (m.get("poster") or {}).get("url"),
                })
                for group in r["showtimes"].values():
                    for st in group:
                        sessions.append({
                            "movieId": mid,
                            "cinema": code,
                            "time": st["startsAt"][11:16],
                            "version": version(st),
                            "experience": st.get("experience"),
                            "preview": st.get("isPreview", False),
                            "ticket": ticket_url(st),
                        })
            page += 1
            time.sleep(0.5)

    sessions.sort(key=lambda s: s["time"])
    out = Path(__file__).resolve().parent.parent / "src" / "data" / f"seances-{date}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "date": date,
        "cinemas": THEATERS,
        "movies": list(movies.values()),
        "sessions": sessions,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(movies)} films, {len(sessions)} séances -> {out}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "2026-10-09")
