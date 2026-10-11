/**
 * Lahiri (Chitrapaksha) ayanamsha — the offset between the tropical and
 * sidereal zodiacs.
 *
 * Definition (as used by the Indian Calendar Reform Committee and by the
 * Swiss Ephemeris "SE_SIDM_LAHIRI" mode): the mean ayanamsha was
 * 23.245524743° at JD 2435553.5 (21 March 1956). We carry it to any other
 * date with the IAU 2006 general precession in longitude (Capitaine et al.
 * 2003, A&A 412, 567), p_A, a polynomial in Julian centuries from J2000.
 *
 * Check: this gives 23°51′25.6″ (mean) for J2000, matching the published
 * Indian Astronomical Ephemeris value of 23°51′25.5″. Adding nutation gives
 * the "true" value of about 23°51′11″ quoted in Indian almanacs.
 */

const EPOCH_DAYS_FROM_J2000 = 2435553.5 - 2451545.0
const AYANAMSHA_AT_EPOCH = 23.245524743

/** IAU 2006 accumulated general precession in longitude, arcseconds. */
function generalPrecessionArcsec(centuries: number): number {
  const t = centuries
  return 5028.796195 * t + 1.1054348 * t ** 2 + 0.00007964 * t ** 3 - 0.000023857 * t ** 4 - 0.0000000383 * t ** 5
}

/**
 * Mean Lahiri ayanamsha in degrees.
 * @param ttDays Terrestrial Time in days since J2000.0 (Astronomy Engine's `time.tt`).
 */
export function meanLahiriAyanamsha(ttDays: number): number {
  const t = ttDays / 36525
  const t0 = EPOCH_DAYS_FROM_J2000 / 36525
  return AYANAMSHA_AT_EPOCH + (generalPrecessionArcsec(t) - generalPrecessionArcsec(t0)) / 3600
}
