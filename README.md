# Dhuni Baba 🔥

A playful Vedic-astrology website. Visitors enter their name, birth date, time
and place; Dhuni Baba reads their chart with traditional — and deliberately
funny — interpretations of love, compatibility and marriage.

> **For entertainment only.** Astrology is a cultural tradition, not
> established science. Do not take astrology seriously!!!

Available in English, Tamil, Telugu, Hindi, Malayalam, Kannada, Odia, Bengali,
Marathi, Punjabi and French.

## Status

| Stage | What | State |
| --- | --- | --- |
| 1 | Design system, landing page, birth-details form, navigation, 11 languages | ✅ Done |
| 2 | Real planetary calculations + Kundli dashboard | Next |
| 3 | Chart-grounded readings (personality, love, Guna Milan, Mangal Dosha) | Planned |
| 4 | Shareable report, PDF, more tests, deployment | Planned |

Until Stage 2 lands, the Kundli page shows your validated details and UTC
birth time, plus a chart frame clearly labelled **"Demonstration only"**.
No planet positions are ever invented.

## Run it on your computer

You need **Node.js 20.19 or newer** (check with `node -v`; download from nodejs.org).

```bash
npm install      # once: downloads the libraries into node_modules/
npm run dev      # starts the site at http://localhost:5173 and reloads as you edit
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the automated tests once (`npm run test:watch` keeps re-running) |
| `npm run typecheck` | TypeScript checks for mistakes without running anything |
| `npm run lint` | Spots common bugs and bad patterns |
| `npm run build` | Produces the final website in `dist/` |
| `npm run preview` | Serves the built `dist/` locally to try it |
| `npm run check` | All of the above in one go — run before every commit |

## Where things live

```
src/
  main.tsx              starting point: wires up router, languages, birth-details store
  App.tsx               the list of pages (routes)
  pages/                one file per page (+ its .module.css)
  components/           reusable pieces: Header, Footer, FormField, PlaceSearch, illustrations
  styles/tokens.css     ALL colours, fonts and spacing — change the look here
  i18n/locales/*.ts     the text in every language (en.ts is the master list)
  data/                 validation, time-zone conversion, place search, session storage
  astrology/            documented conventions (calculations arrive in Stage 2)
  interpretation/       Baba's readings (Stage 3)
docs/                   architecture, licences, deployment
```

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## How to… (beginner recipes)

**Change some text** — edit the key in `src/i18n/locales/en.ts`, then the same
key in the other language files. If you forget one, `npm run typecheck`
tells you which file.

**Add a new piece of text** — add a key to `en.ts`, use it with
`t('your.key')` in a component, then add it to every other locale.
`npm test` fails until all languages have it.

**Change a colour** — edit `src/styles/tokens.css`.

**Add a page** — create `src/pages/MyPage.tsx`, then add
`<Route path="my-page" element={<MyPage />} />` in `src/App.tsx`.

## Debugging tips

- Open the browser's DevTools (F12) → **Console** for errors, **Network**
  to watch the place-search request to `geocoding-api.open-meteo.com`.
- DevTools → **Application → Session Storage** shows the saved birth
  details (key `dhuni-baba:birth-details`). Delete it to start fresh.
- A failing test prints the expected vs. actual value — start there.
- Place search failing? Use "Enter coordinates manually" — the rest of the
  app works without the network.

## Astrology conventions

Sidereal zodiac, Lahiri ayanamsha, whole-sign houses, mean node, North Indian
chart, IANA time zones. The full, plain-language list (with what is active vs.
planned) is on the site's **Method** page and in
[`src/astrology/conventions.ts`](src/astrology/conventions.ts).

## Privacy

No accounts, no database, no analytics, no cookies. Birth details live only in
the browser tab's `sessionStorage` and disappear when the tab is closed. The
only outbound request is the typed place name, sent to Open-Meteo for
geocoding. See the **Privacy** page.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Cloudflare Pages
(recommended), Vercel, or fully self-hosted with Caddy.

## Credits & licences

Place data © GeoNames (CC BY 4.0) via Open-Meteo. Fonts under SIL OFL 1.1.
All libraries are MIT / Apache-2.0 — see [docs/LICENSES.md](docs/LICENSES.md).
The Dhuni Baba illustration is original SVG artwork made for this project.
Translations are machine-assisted and should be reviewed by native speakers.

Code licence: MIT (see `LICENSE`).
