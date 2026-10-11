/**
 * Fixed divisions of the zodiac used in Vedic astrology.
 * Pure arithmetic — no astronomy here.
 */

export const SIGN_SPAN = 30
export const NAKSHATRA_SPAN = 360 / 27 // 13°20′
export const PADA_SPAN = NAKSHATRA_SPAN / 4 // 3°20′

/** Wrap any angle into [0, 360). */
export function normalize(degrees: number): number {
  const wrapped = degrees % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

/** 0 = Mesha (Aries) … 11 = Meena (Pisces). */
export function signOf(longitude: number): number {
  return Math.floor(normalize(longitude) / SIGN_SPAN)
}

export function degreeInSign(longitude: number): number {
  return normalize(longitude) % SIGN_SPAN
}

/** 0 = Ashwini … 26 = Revati. */
export function nakshatraOf(longitude: number): number {
  return Math.min(26, Math.floor(normalize(longitude) / NAKSHATRA_SPAN))
}

/** 1 to 4. */
export function padaOf(longitude: number): number {
  return Math.min(4, Math.floor((normalize(longitude) % NAKSHATRA_SPAN) / PADA_SPAN) + 1)
}

/** 23.5 → { degrees: 23, minutes: 30 } (minutes rounded down so 29°59′ never shows as 30°). */
export function toDegreesMinutes(value: number): { degrees: number; minutes: number } {
  const totalMinutes = Math.floor(value * 60 + 1e-9)
  return { degrees: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 }
}

/** Whole-sign house of a body: the ascendant's sign is house 1. */
export function wholeSignHouse(bodySign: number, ascendantSign: number): number {
  return ((bodySign - ascendantSign + 12) % 12) + 1
}
