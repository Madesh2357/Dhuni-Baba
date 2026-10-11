/**
 * Thin wrapper around Astronomy Engine (MIT, https://github.com/cosinekitty/astronomy).
 *
 * Every function here returns *tropical* longitudes measured from the true
 * equinox of date (i.e. including precession and nutation), which is what
 * the sidereal conversion in chart.ts expects.
 */
import * as Astronomy from 'astronomy-engine'
import type { AstroTime } from 'astronomy-engine'
import { normalize } from './zodiac'

export type PlanetId = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn'

const BODY: Record<Exclude<PlanetId, 'sun' | 'moon'>, Astronomy.Body> = {
  mars: Astronomy.Body.Mars,
  mercury: Astronomy.Body.Mercury,
  jupiter: Astronomy.Body.Jupiter,
  venus: Astronomy.Body.Venus,
  saturn: Astronomy.Body.Saturn,
}

export function makeTime(utc: Date): AstroTime {
  return Astronomy.MakeTime(utc)
}

/** Shift an AstroTime by a number of days. */
export function addDays(time: AstroTime, days: number): AstroTime {
  return time.AddDays(days)
}

/** Apparent geocentric ecliptic longitude (true equinox of date), degrees. */
export function tropicalLongitude(planet: PlanetId, time: AstroTime): number {
  if (planet === 'sun') return Astronomy.SunPosition(time).elon
  if (planet === 'moon') return Astronomy.EclipticGeoMoon(time).lon
  // GeoVector corrects for light-travel time and (with `true`) aberration.
  return Astronomy.Ecliptic(Astronomy.GeoVector(BODY[planet], time, true)).elon
}

/** Nutation in longitude (degrees) and true obliquity of the ecliptic (degrees). */
export function earthTilt(time: AstroTime): { nutationLongitude: number; trueObliquity: number } {
  const tilt = Astronomy.e_tilt(time)
  return { nutationLongitude: tilt.dpsi / 3600, trueObliquity: tilt.tobl }
}

/**
 * Mean longitude of the Moon's ascending node (Rahu), referred to the
 * *mean* equinox of date. Meeus, Astronomical Algorithms, 2nd ed., eq. 47.7.
 */
export function meanNodeLongitude(time: AstroTime): number {
  const t = time.tt / 36525
  return normalize(125.0445479 - 1934.1362891 * t + 0.0020754 * t ** 2 + t ** 3 / 467441 - t ** 4 / 60616000)
}

/**
 * Tropical ecliptic longitude of the ascendant (true equinox of date).
 *
 * Standard spherical-astronomy formula using the local apparent sidereal
 * time (RAMC), the observer's latitude φ and the true obliquity ε:
 *   λ = atan2( cos RAMC, −(sin RAMC · cos ε + tan φ · sin ε) )
 *
 * @param latitude  degrees, north positive
 * @param longitude degrees, east positive
 */
export function tropicalAscendant(time: AstroTime, latitude: number, longitude: number): number {
  const rad = Math.PI / 180
  const ramc = normalize(Astronomy.SiderealTime(time) * 15 + longitude) * rad
  const eps = earthTilt(time).trueObliquity * rad
  const phi = latitude * rad
  const lambda = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)))
  return normalize(lambda / rad)
}
