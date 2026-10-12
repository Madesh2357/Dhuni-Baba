# Architecture

Dhuni Baba is a **static single-page app**. There is no backend: everything
(including, from Stage 2, the planetary maths) runs in the visitor's browser.

```
Browser
 ├─ UI           src/pages, src/components     React components + CSS Modules
 ├─ i18n         src/i18n                      11 languages, lazy-loaded
 ├─ Data         src/data                      validation, time zones, geocoding, session store
 ├─ Astrology    src/astrology                 Astronomy Engine + Lahiri + dashas (lazy-loaded)
 └─ Readings     src/interpretation            readings, Love & Marriage, Guna Milan, Mangal Dosha
        │
        └── HTTPS ──► Open-Meteo Geocoding API (place name only, no key)
```

## Why this stack

| Choice | Why |
| --- | --- |
| **Vite** | Fast dev server, one-command builds, zero config to deploy. |
| **React + TypeScript** | Huge community, and TypeScript catches mistakes (e.g. a missing translation) before you run the code. |
| **React Router** | Real URLs for each page (`/begin`, `/kundli`…). |
| **CSS Modules** | Plain CSS, but each component's classes can't clash with another's. |
| **Own tiny i18n** (`src/i18n`) | ~80 lines you can read in one sitting, fully type-checked; no extra library to learn. |
| **Fontsource** | Fonts are self-hosted, so no visitor data goes to Google Fonts. |
| **Vitest + Testing Library** | Tests use the same config as Vite. |
| **oxlint** | Very fast linter, ships with the Vite template. |

## Folder rules (keep these and the code stays maintainable)

1. `src/data`, `src/astrology`, `src/interpretation` contain **no React UI**.
   They are plain functions you can unit-test.
2. Components never hard-code text: they call `t('some.key')`.
3. Validation returns **message keys**, not sentences, so errors are
   translated automatically.
4. Each component's styles sit beside it in `Name.module.css`; colours and
   spacing come only from `src/styles/tokens.css`.

## Data flow of a reading

1. `BirthDetailsPage` collects raw strings into a `BirthFormInput`.
2. `validateBirthForm()` (src/data/validation.ts) returns either errors or
   clean `BirthDetails`.
3. `BirthDetailsProvider` keeps them in memory + `sessionStorage`.
4. `KundliPage` lazy-loads `KundliDashboard`, which calls `computeChart()`
   (src/astrology/chart.ts): local time → UTC → tropical positions → minus
   Lahiri ayanamsha → signs, nakshatras, houses and dashas.

## Planned stages

- **Stage 1 (done)** — design system, landing page, form, navigation, 11 languages, privacy & method pages.
- **Stage 2 (done)** — `astronomy-engine` (MIT) for Sun/Moon/planet longitudes; Lahiri ayanamsha;
  mean node; ascendant; whole-sign houses; nakshatras; Vimshottari dasha; North and South Indian charts.
  Tested against Meeus' worked examples, the Indian Astronomical Ephemeris ayanamsha and Makar Sankranti 2024.
  The dashboard is a lazy-loaded chunk (`src/pages/kundli/`), with loading and error states.
- **Stage 3 (done)** — chart-grounded funny readings (Lagna, Venus, 7th house), Mangal Dosha,
  marriage-timing windows from the dashas, and a Guna Milan page (`/match`). The logic in
  `src/interpretation/` returns *which* reading applies and *why*; the UI only translates it.
- **Love & Marriage (`/love`)** — `src/interpretation/love.ts` builds the report from real chart
  factors: a deliberately made-up *Romance Index* (starts at 50; Venus dignity and house, planets in
  the 7th, Mangal Dosha, Moon–Venus; every point is listed on the page), love language from the
  element of Venus' sign, a red flag from Mars' sign, fights from the Mars–Venus distance, love vs
  arranged from the 5th and 7th lords (or Venus with Rahu), wedding vibe from the 7th lord's element,
  in-laws from the 10th house, and the first dasha marriage window. Without a birth time the
  house-based parts say so instead of guessing. The page is lazy-loaded (`src/pages/love/`).
- **Stage 4 (done)** — share links with details in the URL fragment (`src/data/shareLink.ts`,
  validated like form input on the way back in), `/share` page, print stylesheet for Save as PDF
  (`src/styles/print.css`), Playwright end-to-end + axe accessibility tests (`e2e/`), CI for both,
  deployment guide.
