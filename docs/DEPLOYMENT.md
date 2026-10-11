# Deploying Dhuni Baba

Dhuni Baba is a **static website**: `npm run build` produces plain files in
`dist/`, and everything (including the astronomy) runs in the visitor's
browser. No server, database or API key is needed, which makes hosting free
and simple.

## Option 1 — Cloudflare Pages (recommended)

Free, fast in India, unlimited bandwidth, automatic HTTPS, and a preview URL
for every pull request.

1. Sign up at <https://dash.cloudflare.com> (free plan is enough).
2. **Workers & Pages → Create → Pages → Connect to Git** and authorise GitHub.
3. Choose the **Dhuni-Baba** repository and set:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | `Vite` (or *None*) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Environment variable | `NODE_VERSION` = `22` |

4. **Save and Deploy.** After about a minute the site is live at
   `https://dhuni-baba.pages.dev` (or similar).
5. Optional: **Custom domains → Set up a domain** to use your own address.

What's already prepared in the repo:

- `public/_headers` — security headers, including a strict
  Content-Security-Policy that only allows our own files plus the Open-Meteo
  place search.
- No `404.html`, so Cloudflare serves `index.html` for every path — that is
  what makes links like `/kundli` and `/share#…` work when opened directly.
- `public/robots.txt` — keeps search engines away from `/share` links.

### Deploy from your own computer instead (no Git connection)

```bash
npm run build
npx wrangler pages deploy dist --project-name dhuni-baba
```

`wrangler` (Cloudflare's CLI, Apache-2.0/MIT) asks you to log in the first time.

## Option 2 — Vercel

1. Go to <https://vercel.com/new> and import the GitHub repository.
2. Vercel detects Vite automatically; keep the defaults and click **Deploy**.

`vercel.json` already adds the same security headers and the page fallback.

## Option 3 — Fully open source / self-hosted

Build once and serve `dist/` with any open-source web server. With
**Caddy** (automatic HTTPS):

```
dhunibaba.example.com {
  root * /srv/dhuni-baba/dist
  try_files {path} /index.html
  header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://geocoding-api.open-meteo.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  file_server
}
```

**Codeberg Pages** or **GitHub Pages** also work for free; both need a copy of
`dist/index.html` saved as `dist/404.html` so that direct links load.

## Before you announce it

- [ ] `npm run check` and `npm run test:e2e` pass (CI runs both on every pull request).
- [ ] Open the live site on your phone, enter a birth, try Share and Save as PDF.
- [ ] **Commercial use?** Open-Meteo's free geocoding is for non-commercial use.
      If the site makes money (ads, paid reports), buy an Open-Meteo API plan
      or switch provider — the code for this lives only in `src/data/geocoding.ts`.
- [ ] Ask native speakers to review the translations.
- [ ] If you add analytics later, update the Privacy page first.
