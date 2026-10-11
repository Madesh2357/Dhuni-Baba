import * as Astronomy from 'astronomy-engine'
import { describe, expect, it } from 'vitest'
import type { BirthDetails } from '../data/types'
import { meanLahiriAyanamsha } from './ayanamsha'
import { computeChart, siderealAscendant, siderealLongitudes, trueAyanamsha } from './chart'
import { DASHA_SEQUENCE, nakshatraLord, periodAt, vimshottari } from './dasha'
import { earthTilt, makeTime, meanNodeLongitude, tropicalAscendant, tropicalLongitude } from './engine'
import { degreeInSign, nakshatraOf, padaOf, signOf, toDegreesMinutes, wholeSignHouse } from './zodiac'

const ARCMIN = 1 / 60
/** Terrestrial-Time instant from a Julian Day, as used in Meeus' worked examples. */
const fromJdTT = (jd: number) => Astronomy.AstroTime.FromTerrestrialTime(jd - 2451545.0)

describe('engine vs. Meeus, Astronomical Algorithms (2nd ed.) worked examples', () => {
  it('Sun, 1992 Oct 13.0 TD (Ex. 25.b): λ = 199.90727°', () => {
    expect(Math.abs(tropicalLongitude('sun', fromJdTT(2448908.5)) - 199.90727)).toBeLessThan(ARCMIN)
  })

  it('Moon, 1992 Apr 12.0 TD (Ex. 47.a): λ = 133.16266°', () => {
    expect(Math.abs(tropicalLongitude('moon', fromJdTT(2448724.5)) - 133.16266)).toBeLessThan(ARCMIN)
  })

  it('Venus, 1992 Dec 20.0 TD (Ex. 33.a): λ = 313.08102°', () => {
    expect(Math.abs(tropicalLongitude('venus', fromJdTT(2448976.5)) - 313.08102)).toBeLessThan(ARCMIN)
  })

  it('nutation and obliquity, 1987 Apr 10.0 TD (Ex. 22.a)', () => {
    const tilt = earthTilt(fromJdTT(2446895.5))
    expect(Math.abs(tilt.nutationLongitude * 3600 - -3.788)).toBeLessThan(0.5) // arcsec
    expect(Math.abs(tilt.trueObliquity - 23.4435694)).toBeLessThan(1 / 3600)
  })

  it('mean lunar node, 1992 Apr 12.0 TD (Ex. 47.a): Ω = 274.400656°', () => {
    expect(meanNodeLongitude(fromJdTT(2448724.5))).toBeCloseTo(274.400656, 4)
  })
})

describe('Lahiri ayanamsha', () => {
  it('matches the Indian Astronomical Ephemeris mean value at J2000 (23°51′25.5″)', () => {
    expect(Math.abs(meanLahiriAyanamsha(0) - (23 + 51 / 60 + 25.5 / 3600))).toBeLessThan(1 / 3600)
  })

  it('true value at J2000 is about 23°51′11″ (mean + nutation)', () => {
    expect(Math.abs(trueAyanamsha(fromJdTT(2451545.0)) - (23 + 51 / 60 + 11 / 3600))).toBeLessThan(2 / 3600)
  })

  it('grows by roughly 50.3″ per year', () => {
    const perYear = (meanLahiriAyanamsha(365.25 * 10) - meanLahiriAyanamsha(0)) / 10
    expect(perYear * 3600).toBeCloseTo(50.29, 1)
  })

  it('puts Makar Sankranti 2024 at about 02:43 IST on 15 January, as Indian almanacs do', () => {
    // Sun crosses sidereal 270° between 02:13 and 03:13 IST (20:43–21:43 UTC on 14 Jan).
    expect(siderealLongitudes(makeTime(new Date('2024-01-14T20:43:00Z'))).sun).toBeLessThan(270)
    expect(siderealLongitudes(makeTime(new Date('2024-01-14T21:43:00Z'))).sun).toBeGreaterThan(270)
  })
})

describe('ascendant', () => {
  const rad = Math.PI / 180
  /** Altitude of an ecliptic point (β = 0) for an observer — should be 0 for the ascendant. */
  function altitudeOfEclipticPoint(lambda: number, utc: Date, lat: number, lon: number) {
    const time = makeTime(utc)
    const eps = earthTilt(time).trueObliquity * rad
    const l = lambda * rad
    const ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l))
    const dec = Math.asin(Math.sin(eps) * Math.sin(l))
    const hourAngle = (Astronomy.SiderealTime(time) * 15 + lon) * rad - ra
    const alt = Math.asin(Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(hourAngle))
    return { altitude: alt / rad, east: Math.sin(hourAngle) < 0 }
  }

  const cases: [string, string, number, number][] = [
    ['Chennai', '1995-08-20T01:15:00Z', 13.0827, 80.2707],
    ['Delhi', '1988-01-03T17:40:00Z', 28.6139, 77.209],
    ['Paris', '2001-06-21T10:00:00Z', 48.8566, 2.3522],
    ['Sydney', '2010-11-30T22:05:00Z', -33.8688, 151.2093],
  ]
  for (const [place, iso, lat, lon] of cases) {
    it(`is the ecliptic point rising on the eastern horizon (${place})`, () => {
      const utc = new Date(iso)
      const asc = tropicalAscendant(makeTime(utc), lat, lon)
      const { altitude, east } = altitudeOfEclipticPoint(asc, utc, lat, lon)
      expect(Math.abs(altitude)).toBeLessThan(0.001)
      expect(east).toBe(true)
    })
  }

  it('advances through all twelve signs in about one day', () => {
    const signs = new Set<number>()
    for (let h = 0; h < 24; h++) {
      signs.add(signOf(siderealAscendant(makeTime(new Date(Date.UTC(2020, 0, 1, h))), 13.08, 80.27)))
    }
    expect(signs.size).toBe(12)
  })
})

describe('zodiac divisions', () => {
  it('splits longitudes into sign, nakshatra and pada', () => {
    expect(signOf(0)).toBe(0)
    expect(signOf(359.99)).toBe(11)
    expect(degreeInSign(45.5)).toBeCloseTo(15.5)
    expect(nakshatraOf(13.3333)).toBe(0) // still Ashwini
    expect(nakshatraOf(13.34)).toBe(1) // Bharani
    expect(nakshatraOf(359.999)).toBe(26) // Revati
    expect(padaOf(3.3)).toBe(1)
    expect(padaOf(3.34)).toBe(2)
    expect(toDegreesMinutes(29.9999)).toEqual({ degrees: 29, minutes: 59 })
  })

  it('counts whole-sign houses from the ascendant', () => {
    expect(wholeSignHouse(4, 4)).toBe(1)
    expect(wholeSignHouse(3, 4)).toBe(12)
    expect(wholeSignHouse(10, 4)).toBe(7)
  })
})

describe('Vimshottari dasha', () => {
  const birth = new Date('2000-01-01T00:00:00Z')
  const YEAR = 365.25 * 86_400_000

  it('assigns nakshatra lords in the traditional order', () => {
    expect(nakshatraLord(0)).toBe('ketu') // Ashwini
    expect(nakshatraLord(3)).toBe('moon') // Rohini
    expect(nakshatraLord(26)).toBe('mercury') // Revati
  })

  it('starts a full Ketu period when the Moon is at 0° Ashwini', () => {
    const [first] = vimshottari(0, birth)
    expect(first.lord).toBe('ketu')
    expect(first.start.getTime()).toBe(birth.getTime())
    expect((first.end.getTime() - first.start.getTime()) / YEAR).toBeCloseTo(7)
  })

  it('subtracts the elapsed part of the first period', () => {
    // Moon halfway through Bharani (Venus, 20 years): 10 years already elapsed.
    const [first] = vimshottari(13.3333333 + 6.6666667, birth)
    expect(first.lord).toBe('venus')
    expect((birth.getTime() - first.start.getTime()) / YEAR).toBeCloseTo(10, 3)
  })

  it('covers exactly 120 years, and antardashas fill each mahadasha', () => {
    const dashas = vimshottari(123.4, birth)
    const span = (dashas[8].end.getTime() - dashas[0].start.getTime()) / YEAR
    expect(span).toBeCloseTo(120, 6)
    for (const maha of dashas) {
      expect(maha.antardashas[0].lord).toBe(maha.lord)
      expect(maha.antardashas[0].start.getTime()).toBe(maha.start.getTime())
      expect(Math.abs(maha.antardashas[8].end.getTime() - maha.end.getTime())).toBeLessThan(5)
    }
    expect(DASHA_SEQUENCE.reduce((sum, d) => sum + d.years, 0)).toBe(120)
  })

  it('finds the running period for a date', () => {
    const dashas = vimshottari(0, birth)
    expect(periodAt(dashas, new Date('2003-01-01'))?.lord).toBe('ketu')
    expect(periodAt(dashas, new Date('2010-01-01'))?.lord).toBe('venus')
  })
})

describe('computeChart', () => {
  const chennai = {
    label: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    timeZone: 'Asia/Kolkata',
    source: 'manual' as const,
  }
  const base: BirthDetails = { name: 'Zero', date: '1995-08-20', time: '06:45', timeAccuracy: 'exact', place: chennai }

  it('builds a complete chart for a known birth time', () => {
    const chart = computeChart(base)
    expect(chart.instant.toISOString()).toBe('1995-08-20T01:15:00.000Z')
    expect(chart.ascendant).not.toBeNull()
    expect(chart.grahas).toHaveLength(9)
    expect(chart.grahas.every((g) => g.house !== null && g.house >= 1 && g.house <= 12)).toBe(true)
    // A Chennai sunrise chart: the Sun sits in or next to the 1st house.
    const sun = chart.grahas.find((g) => g.id === 'sun')!
    expect([12, 1]).toContain(sun.house)
    // The sidereal Sun enters Simha (Leo) around 17 August each year.
    expect(sun.sign).toBe(4)
    expect(chart.dashas).toHaveLength(9)
    expect(chart.uncertainty.basis).toBe('exact')
  })

  it('keeps Rahu and Ketu exactly opposite', () => {
    const { grahas } = computeChart(base)
    const rahu = grahas.find((g) => g.id === 'rahu')!
    const ketu = grahas.find((g) => g.id === 'ketu')!
    expect((ketu.longitude - rahu.longitude + 360) % 360).toBeCloseTo(180, 9)
  })

  it('flags retrograde planets (Mercury, 1 June 2021)', () => {
    const chart = computeChart({ ...base, date: '2021-06-01', time: '12:00' })
    expect(chart.grahas.find((g) => g.id === 'mercury')!.retrograde).toBe(true)
    expect(chart.grahas.find((g) => g.id === 'sun')!.retrograde).toBe(false)
  })

  it('omits the ascendant, houses and dashas when the time is unknown', () => {
    const chart = computeChart({ ...base, time: null, timeAccuracy: 'unknown' })
    expect(chart.ascendant).toBeNull()
    expect(chart.dashas).toBeNull()
    expect(chart.grahas.every((g) => g.house === null)).toBe(true)
    expect(chart.uncertainty.basis).toBe('noon')
    expect(chart.instant.toISOString()).toBe('1995-08-20T06:30:00.000Z') // local noon IST
  })

  it('notices when the Moon changes nakshatra during an unknown-time birth date', () => {
    // The Moon covers 12–15° a day, so it crosses a 13°20′ nakshatra boundary on most days.
    let flagged = 0
    for (let day = 1; day <= 10; day++) {
      const date = `2024-03-${String(day).padStart(2, '0')}`
      if (computeChart({ ...base, date, time: null, timeAccuracy: 'unknown' }).uncertainty.moonNakshatraMayChange) flagged++
    }
    expect(flagged).toBeGreaterThanOrEqual(7)
  })

  it('flags a possible Lagna change for approximate times near a sign boundary', () => {
    // Scan a day of approximate times; the Lagna changes sign 12 times, so some must be flagged.
    let flagged = 0
    for (let h = 0; h < 24; h++) {
      const time = `${String(h).padStart(2, '0')}:00`
      if (computeChart({ ...base, time, timeAccuracy: 'approximate' }).uncertainty.ascendantSignMayChange) flagged++
    }
    expect(flagged).toBeGreaterThan(0)
    expect(flagged).toBeLessThan(24)
  })
})
