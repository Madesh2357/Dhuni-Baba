/**
 * Build a sidereal (Lahiri) birth chart from validated birth details.
 * This is the only file the UI needs to call.
 */
import type { AstroTime } from 'astronomy-engine'
import { localToUtc } from '../data/timezone'
import type { BirthDetails } from '../data/types'
import { meanLahiriAyanamsha } from './ayanamsha'
import { vimshottari } from './dasha'
import { addDays, earthTilt, makeTime, meanNodeLongitude, tropicalAscendant, tropicalLongitude, type PlanetId } from './engine'
import { GRAHA_ORDER, type Chart, type GrahaPosition, type ZodiacPoint } from './types'
import { degreeInSign, nakshatraOf, normalize, padaOf, signOf, wholeSignHouse } from './zodiac'

const PLANETS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
const HALF_HOUR_DAYS = 0.5 / 24
const POLAR_LATITUDE = 66

/** True (mean + nutation) Lahiri ayanamsha at an instant, degrees. */
export function trueAyanamsha(time: AstroTime): number {
  return meanLahiriAyanamsha(time.tt) + earthTilt(time).nutationLongitude
}

export function toZodiacPoint(longitude: number): ZodiacPoint {
  const lon = normalize(longitude)
  return {
    longitude: lon,
    sign: signOf(lon),
    degreeInSign: degreeInSign(lon),
    nakshatra: nakshatraOf(lon),
    pada: padaOf(lon),
  }
}

/** Sidereal longitudes of all nine grahas at one instant. */
export function siderealLongitudes(time: AstroTime): Record<(typeof GRAHA_ORDER)[number], number> {
  const ayanamsha = trueAyanamsha(time)
  const out = {} as Record<(typeof GRAHA_ORDER)[number], number>
  for (const planet of PLANETS) out[planet] = normalize(tropicalLongitude(planet, time) - ayanamsha)
  // Mean node is referred to the mean equinox, so subtract the *mean* ayanamsha.
  out.rahu = normalize(meanNodeLongitude(time) - meanLahiriAyanamsha(time.tt))
  out.ketu = normalize(out.rahu + 180)
  return out
}

export function siderealAscendant(time: AstroTime, latitude: number, longitude: number): number {
  return normalize(tropicalAscendant(time, latitude, longitude) - trueAyanamsha(time))
}

/** Signed smallest difference b − a in degrees, in (−180, 180]. */
function angleDiff(a: number, b: number): number {
  const d = normalize(b - a)
  return d > 180 ? d - 360 : d
}

export function computeChart(details: BirthDetails): Chart {
  const { place } = details
  const timeKnown = details.time !== null
  const basis = !timeKnown ? 'noon' : details.timeAccuracy === 'approximate' ? 'approximate' : 'exact'

  // Unknown birth time → use local noon, the midpoint of the possible range.
  const instant = localToUtc(details.date, details.time ?? '12:00', place.timeZone).utc
  const time = makeTime(instant)
  const now = siderealLongitudes(time)

  // Speed from positions half a day either side (simple central difference).
  const before = siderealLongitudes(addDays(time, -0.5))
  const after = siderealLongitudes(addDays(time, 0.5))

  const ascendant = timeKnown ? toZodiacPoint(siderealAscendant(time, place.latitude, place.longitude)) : null

  const grahas: GrahaPosition[] = GRAHA_ORDER.map((id) => {
    const point = toZodiacPoint(now[id])
    const speed = angleDiff(before[id], after[id])
    // Sun and Moon never retrograde; the mean nodes always move backwards,
    // which tradition takes for granted, so we only flag the five planets.
    const canRetrograde = id !== 'sun' && id !== 'moon' && id !== 'rahu' && id !== 'ketu'
    return {
      id,
      ...point,
      speed,
      retrograde: canRetrograde && speed < 0,
      house: ascendant ? wholeSignHouse(point.sign, ascendant.sign) : null,
    }
  })

  // —— What could change because the time isn't exact? ——
  const moon = grahas[1]
  let window: [AstroTime, AstroTime] | null = null
  if (basis === 'approximate') window = [addDays(time, -HALF_HOUR_DAYS), addDays(time, HALF_HOUR_DAYS)]
  if (basis === 'noon') {
    window = [
      makeTime(localToUtc(details.date, '00:00', place.timeZone).utc),
      makeTime(localToUtc(details.date, '23:59', place.timeZone).utc),
    ]
  }

  let ascendantSignMayChange = false
  let moonSignMayChange = false
  let moonNakshatraMayChange = false
  if (window) {
    const moonEdges = window.map((t) => siderealLongitudes(t).moon)
    moonSignMayChange = moonEdges.some((lon) => signOf(lon) !== moon.sign)
    moonNakshatraMayChange = moonEdges.some((lon) => nakshatraOf(lon) !== moon.nakshatra)
    if (ascendant) {
      ascendantSignMayChange = window.some(
        (t) => signOf(siderealAscendant(t, place.latitude, place.longitude)) !== ascendant.sign,
      )
    }
  }

  return {
    instant,
    ayanamsha: trueAyanamsha(time),
    ascendant,
    grahas,
    dashas: timeKnown ? vimshottari(moon.longitude, instant) : null,
    uncertainty: {
      basis,
      ascendantSignMayChange,
      moonSignMayChange,
      moonNakshatraMayChange,
      polarLatitude: Math.abs(place.latitude) > POLAR_LATITUDE,
    },
  }
}
