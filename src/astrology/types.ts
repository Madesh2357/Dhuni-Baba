export type GrahaId = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu'

export const GRAHA_ORDER: GrahaId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']

/** A point on the sidereal zodiac, broken down into the usual divisions. */
export interface ZodiacPoint {
  /** Sidereal longitude, 0 ≤ x < 360. */
  longitude: number
  /** 0 = Mesha (Aries) … 11 = Meena (Pisces). */
  sign: number
  degreeInSign: number
  /** 0 = Ashwini … 26 = Revati. */
  nakshatra: number
  pada: number
}

export interface GrahaPosition extends ZodiacPoint {
  id: GrahaId
  /** Apparent motion in degrees per day (negative = retrograde). */
  speed: number
  retrograde: boolean
  /** Whole-sign house from the Lagna; null when the birth time is unknown. */
  house: number | null
}

export interface DashaPeriod {
  lord: GrahaId
  start: Date
  end: Date
}

export interface MahaDasha extends DashaPeriod {
  antardashas: DashaPeriod[]
}

/**
 * How the moment was chosen and what could change because of time uncertainty.
 * The UI turns each flag into an honest notice.
 */
export interface Uncertainty {
  basis: 'exact' | 'approximate' | 'noon'
  /** Approximate time: the Lagna sign differs somewhere within ±30 minutes. */
  ascendantSignMayChange: boolean
  /** Moon's sign differs within the uncertainty window (±30 min, or the whole day). */
  moonSignMayChange: boolean
  /** Moon's nakshatra differs within the uncertainty window. */
  moonNakshatraMayChange: boolean
  /** Latitude beyond ±66°: the ascendant formula becomes unreliable near the poles. */
  polarLatitude: boolean
}

export interface Chart {
  /** The UTC instant the positions were computed for. */
  instant: Date
  /** True Lahiri ayanamsha used (degrees). */
  ayanamsha: number
  /** null when the birth time is unknown. */
  ascendant: ZodiacPoint | null
  grahas: GrahaPosition[]
  /** null when the birth time is unknown (the Moon moves too far in a day). */
  dashas: MahaDasha[] | null
  uncertainty: Uncertainty
}
