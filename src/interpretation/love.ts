/**
 * The Love & Marriage report. Pure functions: every result names the chart
 * factor behind it, and the UI adds the (deliberately ridiculous) jokes.
 *
 * The "Romance Index" is openly invented — a playful score built from real,
 * traditional factors (Venus' dignity and house, planets in the 7th, Mangal
 * Dosha…). The page says so in plain words.
 */
import type { Chart, GrahaId } from '../astrology'
import { computeReadings, mangalFrom, type MarriageWindow } from './readings'
import { SIGN_LORD, venusDignity } from './rulers'

export type Element = 'fire' | 'earth' | 'air' | 'water'
const ELEMENTS: Element[] = ['fire', 'earth', 'air', 'water']
/** Mesha fire, Vrishabha earth, Mithuna air, Karka water, and so on around the zodiac. */
export const elementOf = (sign: number): Element => ELEMENTS[sign % 4]

export type LoveFactorId =
  | 'venusExalted' | 'venusOwn' | 'venusDebilitated' | 'venusNeutral'
  | 'venusAngle' | 'venusTrine' | 'venusHidden'
  | 'seventhBenefic' | 'seventhMalefic'
  | 'mangal' | 'moonVenus' | 'venusRetro'

export interface LoveFactor {
  id: LoveFactorId
  points: number
  /** Raw details for the sentence: a sign index, a house number or planet ids. */
  sign?: number
  house?: number
  planets?: GrahaId[]
}

export type RomanceBand = 'slowburn' | 'steady' | 'romantic' | 'filmy'

export interface LoveReport {
  index: { score: number; factors: LoveFactor[]; band: RomanceBand; usedHouses: boolean }
  venusSign: number
  marsSign: number
  /** Love language from the element of Venus' sign. */
  loveLanguage: Element
  fights: 'together' | 'opposite' | 'calm'
  /** null without a birth time (needs houses). */
  marriageType: { kind: 'love' | 'loveRahu' | 'arranged'; lord5: GrahaId; lord7: GrahaId } | null
  /** Element of the sign the 7th lord occupies (works from the Moon too). */
  wedding: { lord: GrahaId; element: Element }
  /** 10th house (4th from the 7th: the mother-in-law), null without a birth time. */
  inLaws: { sign: number; element: Element } | null
  /** First upcoming traditional marriage window, undefined if none, null without a birth time. */
  shaadiAlert: MarriageWindow | undefined | null
}

export const BASE_SCORE = 50
const BENEFICS: GrahaId[] = ['jupiter', 'venus', 'mercury', 'moon']
const MALEFICS: GrahaId[] = ['saturn', 'mars', 'rahu', 'ketu', 'sun']

export function romanceBand(score: number): RomanceBand {
  if (score < 40) return 'slowburn'
  if (score < 60) return 'steady'
  if (score < 80) return 'romantic'
  return 'filmy'
}

export function computeLoveReport(chart: Chart, now: Date = new Date()): LoveReport {
  const get = (id: GrahaId) => chart.grahas.find((g) => g.id === id)!
  const venus = get('venus')
  const mars = get('mars')
  const moon = get('moon')
  const rahu = get('rahu')
  const hasHouses = chart.ascendant !== null
  const reference = chart.ascendant?.sign ?? moon.sign

  // —— Romance Index ——
  const factors: LoveFactor[] = []
  const dignity = venusDignity(venus.sign)
  if (dignity === 'exalted') factors.push({ id: 'venusExalted', points: 20 })
  else if (dignity === 'own') factors.push({ id: 'venusOwn', points: 15 })
  else if (dignity === 'debilitated') factors.push({ id: 'venusDebilitated', points: -10 })
  else factors.push({ id: 'venusNeutral', points: 0, sign: venus.sign })

  if (hasHouses && venus.house) {
    if ([1, 4, 7, 10].includes(venus.house)) factors.push({ id: 'venusAngle', points: 10, house: venus.house })
    else if ([5, 9].includes(venus.house)) factors.push({ id: 'venusTrine', points: 10, house: venus.house })
    else if ([6, 8, 12].includes(venus.house)) factors.push({ id: 'venusHidden', points: -5, house: venus.house })

    const inSeventh = chart.grahas.filter((g) => g.house === 7).map((g) => g.id)
    const kind = inSeventh.filter((id) => BENEFICS.includes(id))
    const tough = inSeventh.filter((id) => MALEFICS.includes(id))
    if (kind.length) factors.push({ id: 'seventhBenefic', points: 8 * kind.length, planets: kind })
    if (tough.length) factors.push({ id: 'seventhMalefic', points: -4 * tough.length, planets: tough })
  }

  const mangal = mangalFrom(mars.sign, reference)
  if (mangal.present) factors.push({ id: 'mangal', points: -5, house: mangal.house })
  if (moon.sign === venus.sign) factors.push({ id: 'moonVenus', points: 5 })
  if (venus.retrograde) factors.push({ id: 'venusRetro', points: 0 })

  const raw = BASE_SCORE + factors.reduce((sum, f) => sum + f.points, 0)
  const score = Math.max(5, Math.min(99, raw))

  // —— Fights: Mars vs Venus ——
  const gap = (mars.sign - venus.sign + 12) % 12
  const fights = gap === 0 ? 'together' : gap === 6 ? 'opposite' : 'calm'

  // —— Love or arranged? (5th lord = romance, 7th lord = marriage) ——
  let marriageType: LoveReport['marriageType'] = null
  if (chart.ascendant) {
    const asc = chart.ascendant.sign
    const fifthSign = (asc + 4) % 12
    const seventhSign = (asc + 6) % 12
    const lord5 = SIGN_LORD[fifthSign]
    const lord7 = SIGN_LORD[seventhSign]
    const l5 = get(lord5)
    const l7 = get(lord7)
    const connected =
      l5.sign === l7.sign || // together in one sign
      (l5.sign === seventhSign && l7.sign === fifthSign) || // exchange of signs
      l5.sign === seventhSign ||
      l7.sign === fifthSign
    const kind = connected ? 'love' : venus.sign === rahu.sign ? 'loveRahu' : 'arranged'
    marriageType = { kind, lord5, lord7 }
  }

  const lord7 = SIGN_LORD[(reference + 6) % 12]
  const tenth = chart.ascendant ? (chart.ascendant.sign + 9) % 12 : null
  const readings = computeReadings(chart, chart.instant, now)

  return {
    index: { score, factors, band: romanceBand(score), usedHouses: hasHouses },
    venusSign: venus.sign,
    marsSign: mars.sign,
    loveLanguage: elementOf(venus.sign),
    fights,
    marriageType,
    wedding: { lord: lord7, element: elementOf(get(lord7).sign) },
    inLaws: tenth === null ? null : { sign: tenth, element: elementOf(tenth) },
    shaadiAlert: readings.marriage ? readings.marriage.windows[0] : null,
  }
}
