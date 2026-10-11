# Third-party licences

Checked on 2026-10-11 from each package's `package.json` in `node_modules`.

## Shipped to visitors

| Package | Licence | Use |
| --- | --- | --- |
| react, react-dom 19 | MIT | UI |
| react-router-dom 7 | MIT | Page routing |
| astronomy-engine 2.1.19 | MIT | Planetary positions, sidereal time, nutation |
| @fontsource/dm-sans | OFL-1.1 | Interface font |
| @fontsource/cormorant-garamond | OFL-1.1 | Heading font |
| @fontsource/noto-sans-{devanagari, tamil, telugu, malayalam, kannada, oriya, bengali, gurmukhi} | OFL-1.1 | Indian-script fonts |

## Development only (not shipped)

vite (MIT), @vitejs/plugin-react (MIT), typescript (Apache-2.0),
vitest (MIT), jsdom (MIT), @testing-library/* (MIT), oxlint (MIT),
@playwright/test (Apache-2.0), @axe-core/playwright and axe-core (MPL-2.0 —
file-level copyleft that only matters if you modify and distribute axe itself;
it is a test tool and never shipped to visitors).

## External data / services

| Service | Terms |
| --- | --- |
| Open-Meteo Geocoding API | Free without a key for **non-commercial** use. Commercial use needs an Open-Meteo API subscription. |
| GeoNames (data behind Open-Meteo) | CC BY 4.0 — attribution shown in the site footer. |

## Why not Swiss Ephemeris?

Swiss Ephemeris is the classic astrology library, but its licence is **AGPL**
or paid. Shipping it in the browser would force the whole site's source to be
AGPL. Astronomy Engine (MIT) is accurate to about ±1 arcminute — far finer than
any astrological boundary needs — and our tests check it against published
values.

To check a package's licence yourself before adding it:

```bash
npm view astronomy-engine license   # prints: MIT
```

Prefer MIT, BSD, Apache-2.0, ISC or OFL. Avoid GPL/AGPL in code shipped to
the browser unless you are happy to release the whole site under that licence.
