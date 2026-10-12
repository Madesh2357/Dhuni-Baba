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
| 2 | Real planetary calculations + Kundli dashboard | ✅ Done |
| 3 | Chart-grounded readings, Guna Milan compatibility, Mangal Dosha, marriage timing | ✅ Done |
| 4 | Shareable report links, Save as PDF, end-to-end & accessibility tests, deployment | ✅ Done |
| + | Love & Marriage report (`/love`): Romance Index, love language, red flag, fight forecast, love vs arranged, wedding vibe, in-laws, Shaadi alert | ✅ Done |

The Kundli dashboard shows the Lagna, Moon sign, nakshatra, a North or South
Indian chart, a table of all nine grahas (with retrograde flags and houses)
and the Vimshottari dasha timeline. Positions come from **Astronomy Engine**
(MIT) and are tested against textbook values; nothing is invented. Unknown or
approximate birth times are handled openly — see the Method page.

## Run it on your computer

You need **Node.js 20.19 or newer** (check with `node -v`; download from nodejs.org).

```bash
npm install      # once: downloads the libraries into node_modules/
npm run dev      # starts the site at http://localhost:5173 and reloads as you edit
```

### Open it on your phone

Your phone and PC must be on the same Wi-Fi.

```bash
npm run dev:mobile   # prints a "Network:" address such as http://192.168.1.23:5173
```

Type that **Network** address into your phone's browser. (If it doesn't load,
your PC's firewall may be blocking port 5173 — on Ubuntu: `sudo ufw allow 5173`.)

### If the Kundli page doesn't work

1. Stop the server (Ctrl + C), then run `git pull` and **`npm install`** —
   new stages add libraries, and a missing library stops the page from loading.
2. Start again with `npm run dev` and do a hard refresh (Ctrl + Shift + R).
3. Still stuck? Open DevTools (F12) → **Console**, and send the red error text.

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the automated tests once (`npm run test:watch` keeps re-running) |
| `npm run typecheck` | TypeScript checks for mistakes without running anything |
| `npm run lint` | Spots common bugs and bad patterns |
| `npm run build` | Produces the final website in `dist/` |
| `npm run preview` | Serves the built `dist/` locally to try it |
| `npm run check` | All of the above in one go — run before every commit |
| `npm run test:e2e` | Builds the site and clicks through it in a real browser (phone + desktop), with an accessibility audit. First run `npx playwright install chromium` once |

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
  astrology/            calculations: engine.ts, ayanamsha.ts, chart.ts, dasha.ts (+ tests)
  interpretation/       readings, Love & Marriage report, Guna Milan and Mangal Dosha (pure functions + tests)
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

How a chart is calculated (`src/astrology/chart.ts`):

1. Local birth time → UTC (`src/data/timezone.ts`).
2. Astronomy Engine gives each body's apparent tropical longitude.
3. Subtract the Lahiri ayanamsha (`ayanamsha.ts`) → sidereal longitude.
4. Split into sign, nakshatra and pada (`zodiac.ts`); houses are whole signs from the Lagna.
5. The Moon's nakshatra starts the Vimshottari dasha (`dasha.ts`).

Sidereal zodiac, Lahiri ayanamsha, whole-sign houses, mean node, North Indian
chart, IANA time zones. The full, plain-language list (with what is active vs.
planned) is on the site's **Method** page and in
[`src/astrology/conventions.ts`](src/astrology/conventions.ts).

## Sharing and PDF

- **Share this reading** creates a link like `/share#v1.…`. The birth details
  are packed into the part after `#`, which browsers never send to servers —
  so sharing works without storing anything. Anyone with the link can read the
  details, and the page says so.
- **Save as PDF / Print** opens the browser's print dialog; choose *Save as
  PDF*. A dedicated print stylesheet gives a clean, light, button-free report.

## Privacy

No accounts, no database, no analytics, no cookies. Birth details live only in
the browser tab's `sessionStorage` and disappear when the tab is closed. The
only outbound request is the typed place name, sent to Open-Meteo for
geocoding. See the **Privacy** page.

## Deployment

Live on Cloudflare Workers; every push to `main` redeploys. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Cloudflare Workers/Pages, Vercel, or
fully self-hosted with Caddy.

## Credits & licences

Place data © GeoNames (CC BY 4.0) via Open-Meteo. Fonts under SIL OFL 1.1.
Shipped libraries are MIT; dev tools are MIT / Apache-2.0 / MPL-2.0 — see [docs/LICENSES.md](docs/LICENSES.md).
The Dhuni Baba illustration is original SVG artwork made for this project.
Translations are machine-assisted and should be reviewed by native speakers.

Code licence: MIT (see `LICENSE`).
