/**
 * The astrological conventions Dhuni Baba follows.
 *
 * This file is the single source of truth: the Method page renders it, and
 * the Stage 2 calculation code will import the same constants, so the
 * documentation can never drift away from what the code actually does.
 */

export type ConventionStatus = 'active' | 'stage2' | 'stage3'

export interface Convention {
  topic: string
  choice: string
  detail: string
  status: ConventionStatus
}

export const ZODIAC = 'sidereal' as const
export const AYANAMSHA = 'lahiri' as const
export const HOUSE_SYSTEM = 'whole-sign' as const
export const LUNAR_NODE = 'mean' as const
export const CHART_STYLE = 'north-indian' as const

export const CONVENTIONS: Convention[] = [
  {
    topic: 'Time conversion',
    choice: 'IANA time-zone database (built into your browser)',
    detail:
      'Your local clock time is converted to Universal Time using the historical rules for the chosen zone, including India’s 1941–45 war time and every daylight-saving change elsewhere. Times that occurred twice are flagged and the earlier one is used; times that never existed are rejected. Known limitation: Bombay Time (used in Mumbai until 1955) and Calcutta Time (Kolkata until 1948) are not modelled by Asia/Kolkata — if your birth was recorded in those local times, the computed UTC may be off by up to about 40 minutes. A manual UTC-offset override is planned.',
    status: 'active',
  },
  {
    topic: 'Coordinates',
    choice: 'GeoNames via the Open-Meteo Geocoding API, or manual entry',
    detail:
      'WGS84 decimal degrees, north and east positive. City-level coordinates are accurate to a few kilometres, which moves the ascendant by only a fraction of a degree — negligible next to birth-time uncertainty.',
    status: 'active',
  },
  {
    topic: 'Supported dates',
    choice: '1 January 1800 to today',
    detail: 'Earlier dates are rejected rather than computed with weaker time-zone and ephemeris data.',
    status: 'active',
  },
  {
    topic: 'Astronomical engine',
    choice: 'Astronomy Engine by Don Cross (MIT licence)',
    detail:
      'An open-source library based on VSOP87 and NOVAS models, accurate to about ±1 arcminute for the Sun, Moon and planets. It runs entirely in your browser — no API, no key, no server.',
    status: 'active',
  },
  {
    topic: 'Zodiac',
    choice: 'Sidereal (nirayana)',
    detail: 'Tropical longitudes from the engine are converted to sidereal by subtracting the ayanamsha.',
    status: 'active',
  },
  {
    topic: 'Ayanamsha',
    choice: 'Lahiri (Chitrapaksha)',
    detail:
      'The standard adopted by the Indian Calendar Reform Committee (1955) and used in Indian government almanacs. Mean value = 23.245524743° at 21 March 1956, carried forward with the IAU 2006 precession; nutation is added for the true value. Automated tests check it against the Indian Astronomical Ephemeris (23°51′25.5″ mean at J2000) and against Makar Sankranti 2024.',
    status: 'active',
  },
  {
    topic: 'Grahas',
    choice: 'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu',
    detail:
      'Geocentric apparent positions (corrected for light-time, aberration and nutation). Rahu is the mean lunar node (Meeus, eq. 47.7); Ketu is exactly opposite. A planet is marked retrograde when its longitude is decreasing. Uranus, Neptune and Pluto are not used.',
    status: 'active',
  },
  {
    topic: 'Ascendant (Lagna) and houses',
    choice: 'Whole-sign houses from the Lagna',
    detail:
      'The ascendant is computed from local apparent sidereal time, latitude and the true obliquity of the ecliptic. The sign it falls in becomes the 1st house; each following sign is the next house.',
    status: 'active',
  },
  {
    topic: 'Chart style',
    choice: 'North Indian (diamond) or South Indian (grid)',
    detail: 'North Indian: house 1 at the top centre, houses running anticlockwise. South Indian: signs fixed in a 4 × 4 grid with Meena at the top left, the Lagna marked by a diagonal line. Tamil, Telugu, Malayalam and Kannada default to South Indian.',
    status: 'active',
  },
  {
    topic: 'Nakshatras and dashas',
    choice: '27 equal nakshatras; Vimshottari dasha',
    detail:
      'Each nakshatra spans 13°20′ with four padas of 3°20′. Vimshottari periods use a 120-year cycle with 365.25-day years (other year lengths exist in practice).',
    status: 'active',
  },
  {
    topic: 'Unknown or approximate birth time',
    choice: 'Shown honestly, never guessed',
    detail:
      'With no birth time, positions are computed for local noon, no ascendant is shown, houses are counted from the Moon (Chandra Lagna) and dashas are withheld. The Moon moves 12–15° a day, so if its sign or nakshatra changes during the birth date, that is flagged. For approximate times, a Lagna, Moon sign or nakshatra that could change within ±30 minutes is flagged.',
    status: 'active',
  },
  {
    topic: 'Compatibility',
    choice: 'Ashtakoota Guna Milan (36 points)',
    detail: 'Based on both partners’ Moon nakshatra and sign, following the common North Indian scoring tables.',
    status: 'stage3',
  },
  {
    topic: 'Mangal Dosha',
    choice: 'Mars in houses 1, 2, 4, 7, 8 or 12 from the Lagna',
    detail:
      'Some traditions also count from the Moon and Venus and apply various cancellations; the reading will say which rule produced the result.',
    status: 'stage3',
  },
]
