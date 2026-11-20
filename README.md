# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/cln998/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/cln998/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI
(1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden), built for the
[make.fun gta6-trophy-guide-01 bounty](https://make.fun/c/gta6-trophy-guide-01).

> Built by [@cln998](https://github.com/cln998) for make.fun — try make.fun yourself:
> https://make.fun/r/4f5jaftz

## What it is

A static web app under `app/` — no build step, no network at run time. Open
`app/index.html` from any static server (or run `node serve.ts` and open
http://localhost:8080) in a desktop browser, with the network off, and it works.

- **Every trophy, with its official name, description and grade** as PlayStation
  publishes them, as listed by Exophase and PSNProfiles — plus a guide in our own
  words for each one, naming its sources beside it. No guide text is copied from
  any source, and no Rockstar logo or official artwork is used anywhere.
- **Tracker**: tick trophies off; progress is saved in the browser (localStorage)
  and can be exported to a JSON file and imported back.
- **Filters**: by kind (story, missable, collectibles, activities, strangers,
  crime, exploration, money, online) and by grade, plus earned / not-earned and
  a search box. All 55 trophies are offline and single-player, so the online
  filter is empty on purpose.
- **Spoiler-safe mode**: hides the names and descriptions of story trophies
  until they are earned.
- **Roadmap to the platinum**: six stages built from the official descriptions —
  story, strangers and the one missable trophy, activities, crime, collectibles
  and money, then 100% completion.
- **Missable flags**: one trophy is flagged as possibly missable
  (*Positive Mental Attitude* — meditate at Jason's house in Chapter 1), and six
  stranger trophies are flagged as story-windowed, from the cited guides.

Deep links work too: `?kind=`, `?grade=`, `?show=`, `?search=`, `?spoiler=on`,
`?open=<id>`, `?view=roadmap|missable|tracker`, and `?earned=1,2,3` (a share link that
opens with those trophies ticked).

## Data

- `app/data/trophies.json` — the 55 trophies: official name, description, grade,
  hidden flag (28 hidden, cross-checked against Insider Gaming's hidden /
  non-hidden split and howtovideogame's breakdown, which agree), kind, missable
  flag, count where PlayStation tracks one, roadmap stage, and the guide with
  its named sources.
- `app/data/roadmap.json` — the six roadmap stages.

Note: the starter kit's `trophies.json` did **not** carry a `hidden` field, despite
what the rules text says about it — the hidden flags here were researched from
the sources above and verified: 28 hidden (1 gold, 27 bronze), 27 listed.

## Sources

Each trophy's guide names its sources. The main ones:

- Insider Gaming — Complete GTA 6 Trophy List:
  https://insider-gaming.com/complete-gta-6-trophy-list-how-to-get-all-trophies-achievements/
- PushSquare — GTA 6 Trophy Guide & Roadmap:
  https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap
- EGamers — GTA 6 Trophy List:
  https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
- GTAScoop — GTA 6 Trophies & Achievements:
  https://gtascoop.com/guides/gta-6-trophies-achievements/
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap:
  https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/
- HowToVideoGame — GTA 6: Trophy and Achievement List:
  https://howtovideogame.com/gta-6-trophies/

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the
output directory and writes `dossier.json` with the vendored make.fun library in
`vendor/makefun-frontend.ts` (unchanged from the kit):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of this app in headless Chromium
(see `shots.json` for the views); the first by name is the cover.

## License

MIT — see [LICENSE](LICENSE). Unofficial fan-made guide, not affiliated with
Rockstar Games or PlayStation.
