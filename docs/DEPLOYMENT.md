# Deploying Dhuni Baba

The site is static files (`npm run build` → `dist/`). Any static host works.
Security headers are pre-configured for both recommended hosts.

## Recommended: Cloudflare Pages (free, fast in India, unlimited bandwidth)

1. Push this repository to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick the repo and set:
   - Framework preset: **Vite** (or none)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. Deploy. Every push to `main` redeploys; every pull request gets a preview URL.

`public/_headers` adds the security headers (Content-Security-Policy etc.).
Cloudflare Pages automatically serves `index.html` for unknown paths when a
site has no `404.html`, so routes like `/kundli` work on refresh.

## Alternative: Vercel

Import the GitHub repo at vercel.com/new — it detects Vite automatically.
`vercel.json` adds the same headers and the SPA fallback.

## Fully open-source / self-hosted

Build once, then serve `dist/` with any open-source web server, e.g. **Caddy**:

```
dhunibaba.example.com {
  root * /srv/dhuni-baba/dist
  try_files {path} /index.html
  file_server
}
```

Or use **Codeberg Pages** / **GitHub Pages** (both free; GitHub Pages needs a
`404.html` copy of `index.html` for client-side routes).

## Before going public

- [ ] `npm run check` passes.
- [ ] If the site earns money (ads, paid reports), switch geocoding to a paid
      Open-Meteo plan or another provider — the free tier is non-commercial.
- [ ] Ask native speakers to review the translations.
