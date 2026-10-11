/**
 * Vimshottari dasha — the 120-year cycle of planetary periods.
 *
 * The starting period is ruled by the lord of the Moon's nakshatra at birth,
 * and the portion already "used up" equals how far the Moon has travelled
 * through that nakshatra. Years are 365.25 days (a common convention;
 * some astrologers use 360 or 365.2422).
 */
import { NAKSHATRA_SPAN, nakshatraOf, normalize } from './zodiac'
import type { DashaPeriod, GrahaId, MahaDasha } from './types'

export const DASHA_SEQUENCE: { lord: GrahaId; years: number }[] = [
  { lord: 'ketu', years: 7 },
  { lord: 'venus', years: 20 },
  { lord: 'sun', years: 6 },
  { lord: 'moon', years: 10 },
  { lord: 'mars', years: 7 },
  { lord: 'rahu', years: 18 },
  { lord: 'jupiter', years: 16 },
  { lord: 'saturn', years: 19 },
  { lord: 'mercury', years: 17 },
]

export const DASHA_YEAR_DAYS = 365.25
const DAY_MS = 86_400_000
const TOTAL_YEARS = 120

/** Lord of a nakshatra: Ashwini → Ketu, Bharani → Venus, … repeating every nine. */
export function nakshatraLord(nakshatra: number): GrahaId {
  return DASHA_SEQUENCE[nakshatra % 9].lord
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * DASHA_YEAR_DAYS * DAY_MS)
}

/**
 * @param moonLongitude sidereal longitude of the Moon at birth
 * @param birth the birth instant
 * @returns nine mahadashas (one full cycle) starting with the birth period,
 *   each with its nine antardashas. The first one starts before birth.
 */
export function vimshottari(moonLongitude: number, birth: Date): MahaDasha[] {
  const lon = normalize(moonLongitude)
  const nakshatra = nakshatraOf(lon)
  const fractionElapsed = (lon - nakshatra * NAKSHATRA_SPAN) / NAKSHATRA_SPAN
  const firstIndex = nakshatra % 9

  let cursor = addYears(birth, -fractionElapsed * DASHA_SEQUENCE[firstIndex].years)
  const result: MahaDasha[] = []

  for (let i = 0; i < 9; i++) {
    const maha = DASHA_SEQUENCE[(firstIndex + i) % 9]
    const mahaStart = cursor
    const antardashas: DashaPeriod[] = []
    let subCursor = mahaStart
    for (let j = 0; j < 9; j++) {
      const sub = DASHA_SEQUENCE[(firstIndex + i + j) % 9]
      const subEnd = addYears(subCursor, (maha.years * sub.years) / TOTAL_YEARS)
      antardashas.push({ lord: sub.lord, start: subCursor, end: subEnd })
      subCursor = subEnd
    }
    cursor = addYears(mahaStart, maha.years)
    result.push({ lord: maha.lord, start: mahaStart, end: cursor, antardashas })
  }
  return result
}

/** The period containing `date`, if any. */
export function periodAt<T extends DashaPeriod>(periods: T[], date: Date): T | undefined {
  const ms = date.getTime()
  return periods.find((p) => p.start.getTime() <= ms && ms < p.end.getTime())
}
