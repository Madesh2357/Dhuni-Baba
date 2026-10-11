/**
 * Chart-grounded readings. Pure functions: they take a calculated Chart and
 * return *which* traditional interpretation applies and *why* (the chart
 * factor). The UI turns that into funny text in the chosen language.
 */
import type { Chart, GrahaId, MahaDasha } from '../astrology'
import { SIGN_LORD } from './rulers'

export interface PersonalityReading {
  /** Lagna when the birth time is known, otherwise the Moon sign. */
  source: 'lagna' | 'moon'
  sign: number
  uncertain: boolean
}

export interface LoveReading {
  venusSign: number
  venusHouse: number | null
}

export interface PartnerReading {
  /** The 7th sign counted from the Lagna (or from the Moon without a birth time). */
  source: 'lagna' | 'moon'
  sign: number
  lord: GrahaId
  uncertain: boolean
}

export interface MangalReading {
  /** House of Mars counted from the Lagna; null without a birth time. */
  fromLagna: { house: number; present: boolean } | null
  fromMoon: { house: number; present: boolean }
  /** Mars in its own sign (Mesha, Vrishchika) or exalted (Makara): a widely cited cancellation. */
  cancelledBySign: boolean
  marsSign: number
}

export interface MarriageWindow {
  maha: GrahaId
  antar: GrahaId
  start: Date
  end: Date
}

export interface Readings {
  personality: PersonalityReading
  love: LoveReading
  partner: PartnerReading
  mangal: MangalReading
  /** null when dashas are unavailable (unknown birth time). */
  marriage: { seventhLord: GrahaId; significators: GrahaId[]; windows: MarriageWindow[] } | null
}

/** Houses that give Mangal Dosha in the most common (Parashari) rule. */
export const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12]
const MARS_STRONG_SIGNS = [0, 7, 9] // Mesha, Vrishchika (own), Makara (exalted)

const houseFrom = (sign: number, from: number) => ((sign - from + 12) % 12) + 1

export function mangalFrom(marsSign: number, referenceSign: number) {
  const house = houseFrom(marsSign, referenceSign)
  return { house, present: MANGAL_HOUSES.includes(house) }
}

const YEAR_MS = 365.25 * 86_400_000

/**
 * Upcoming antardashas ruled by a traditional marriage significator:
 * Venus (karaka of marriage), the 7th lord, and planets in the 7th house.
 * Only periods starting from age 18, ending after `now`, within 25 years.
 */
export function marriageWindows(
  dashas: MahaDasha[],
  significators: GrahaId[],
  birth: Date,
  now: Date,
  limit = 3,
): MarriageWindow[] {
  const earliest = Math.max(now.getTime(), birth.getTime() + 18 * YEAR_MS)
  const latest = now.getTime() + 25 * YEAR_MS
  const windows: MarriageWindow[] = []
  for (const maha of dashas) {
    for (const antar of maha.antardashas) {
      if (!significators.includes(antar.lord)) continue
      if (antar.end.getTime() <= earliest || antar.start.getTime() > latest) continue
      windows.push({ maha: maha.lord, antar: antar.lord, start: antar.start, end: antar.end })
      if (windows.length === limit) return windows
    }
  }
  return windows
}

export function computeReadings(chart: Chart, birth: Date, now: Date = new Date()): Readings {
  const get = (id: GrahaId) => chart.grahas.find((g) => g.id === id)!
  const moon = get('moon')
  const mars = get('mars')
  const venus = get('venus')
  const { uncertainty } = chart

  const reference = chart.ascendant?.sign ?? moon.sign
  const source = chart.ascendant ? 'lagna' : 'moon'
  const referenceUncertain = chart.ascendant ? uncertainty.ascendantSignMayChange : uncertainty.moonSignMayChange
  const seventhSign = (reference + 6) % 12
  const seventhLord = SIGN_LORD[seventhSign]

  let marriage: Readings['marriage'] = null
  if (chart.dashas && chart.ascendant) {
    const inSeventh = chart.grahas.filter((g) => g.house === 7).map((g) => g.id)
    const significators = [...new Set<GrahaId>(['venus', seventhLord, ...inSeventh])]
    marriage = { seventhLord, significators, windows: marriageWindows(chart.dashas, significators, birth, now) }
  }

  return {
    personality: { source, sign: reference, uncertain: referenceUncertain },
    love: { venusSign: venus.sign, venusHouse: venus.house },
    partner: { source, sign: seventhSign, lord: seventhLord, uncertain: referenceUncertain },
    mangal: {
      fromLagna: chart.ascendant ? mangalFrom(mars.sign, chart.ascendant.sign) : null,
      fromMoon: mangalFrom(mars.sign, moon.sign),
      cancelledBySign: MARS_STRONG_SIGNS.includes(mars.sign),
      marsSign: mars.sign,
    },
    marriage,
  }
}
