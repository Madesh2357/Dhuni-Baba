import { describe, expect, it } from 'vitest'
import { computeChart } from '../astrology'
import { vimshottari } from '../astrology/dasha'
import type { BirthDetails } from '../data/types'
import {
  bhakootScore, ganaScore, gunaMilan, maitriScore, matchBand, nadiScore, taraScore,
  varnaScore, vashyaGroup, vashyaScore, yoniScore, type MoonPlacement,
} from './gunaMilan'
import { computeReadings, mangalFrom, marriageWindows, MANGAL_HOUSES } from './readings'
import { relation, SIGN_LORD } from './rulers'

/** Moon placed in the middle of a nakshatra (handy for building test cases). */
const moonIn = (nakshatra: number): MoonPlacement => {
  const longitude = nakshatra * (360 / 27) + 6
  return { longitude, sign: Math.floor(longitude / 30), nakshatra }
}

describe('Guna Milan', () => {
  it('scores 28/36 for two people with the same Moon nakshatra (all but Nadi)', () => {
    const rohini = moonIn(3)
    const result = gunaMilan(rohini, rohini)
    expect(result.total).toBe(28)
    expect(result.nadiDosha).toBe(true)
    expect(result.kootas.map((k) => k.max)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('never exceeds 36 or drops below 0 for any pair of nakshatras', () => {
    for (let a = 0; a < 27; a++) {
      for (let b = 0; b < 27; b++) {
        const { total, kootas } = gunaMilan(moonIn(a), moonIn(b))
        expect(total).toBeGreaterThanOrEqual(0)
        expect(total).toBeLessThanOrEqual(36)
        for (const k of kootas) expect(k.score).toBeLessThanOrEqual(k.max)
      }
    }
  })

  it('Varna: 1 point when the groom’s varna is equal or higher', () => {
    const karka = { longitude: 95, sign: 3, nakshatra: 7 } // Brahmin
    const mithuna = { longitude: 65, sign: 2, nakshatra: 4 } // Shudra
    expect(varnaScore(karka, mithuna)).toBe(1)
    expect(varnaScore(mithuna, karka)).toBe(0)
  })

  it('Vashya: Dhanu and Makara split at 15°', () => {
    expect(vashyaGroup({ longitude: 245, sign: 8, nakshatra: 18 })).toBe('human')
    expect(vashyaGroup({ longitude: 255, sign: 8, nakshatra: 19 })).toBe('quadruped')
    expect(vashyaGroup({ longitude: 275, sign: 9, nakshatra: 20 })).toBe('quadruped')
    expect(vashyaGroup({ longitude: 290, sign: 9, nakshatra: 21 })).toBe('water')
    expect(vashyaScore(moonIn(0), moonIn(0))).toBe(2)
  })

  it('Tara: counts of 3, 5 and 7 (mod 9) are inauspicious', () => {
    expect(taraScore(moonIn(0), moonIn(0))).toBe(3)
    // From Ashwini (0) to Krittika (2) is count 3 → bad one way; back is count 26 → 26 % 9 = 8, good.
    expect(taraScore(moonIn(2), moonIn(0))).toBe(1.5)
  })

  it('Yoni: sworn enemies score 0 (e.g. Ashwini horse vs Hasta buffalo)', () => {
    expect(yoniScore(moonIn(0), moonIn(12))).toBe(0)
    expect(yoniScore(moonIn(0), moonIn(23))).toBe(4) // Shatabhisha is also a horse
    expect(yoniScore(moonIn(0), moonIn(1))).toBe(2)
  })

  it('Graha Maitri uses the classical natural friendships', () => {
    expect(relation('sun', 'moon')).toBe('friend')
    expect(relation('moon', 'sun')).toBe('friend')
    expect(relation('venus', 'sun')).toBe('enemy')
    // Mesha (Mars) with Simha (Sun): Mars and Sun are mutual friends.
    expect(maitriScore({ longitude: 5, sign: 0, nakshatra: 0 }, { longitude: 125, sign: 4, nakshatra: 9 })).toBe(5)
    // Simha (Sun) with Tula (Venus): Sun sees Venus as enemy, Venus sees Sun as enemy.
    expect(maitriScore({ longitude: 125, sign: 4, nakshatra: 9 }, { longitude: 185, sign: 6, nakshatra: 14 })).toBe(0)
  })

  it('Gana, Bhakoot and Nadi follow the standard rules', () => {
    expect(ganaScore(moonIn(0), moonIn(2))).toBe(0) // Deva groom, Rakshasa bride
    expect(ganaScore(moonIn(2), moonIn(0))).toBe(1) // Rakshasa groom, Deva bride
    expect(bhakootScore({ longitude: 5, sign: 0, nakshatra: 0 }, { longitude: 35, sign: 1, nakshatra: 2 })).toBe(0) // 2/12
    expect(bhakootScore({ longitude: 5, sign: 0, nakshatra: 0 }, { longitude: 185, sign: 6, nakshatra: 14 })).toBe(7) // 1/7
    expect(nadiScore(moonIn(0), moonIn(5))).toBe(0) // Ashwini & Ardra are both Adi
    expect(nadiScore(moonIn(0), moonIn(1))).toBe(8)
  })

  it('bands totals like the tradition does (18 is the pass mark)', () => {
    expect(matchBand(17.5)).toBe('low')
    expect(matchBand(18)).toBe('ok')
    expect(matchBand(28)).toBe('good')
    expect(matchBand(33)).toBe('great')
  })
})

describe('readings', () => {
  const chennai = { label: 'Chennai', latitude: 13.0827, longitude: 80.2707, timeZone: 'Asia/Kolkata', source: 'manual' as const }
  const base: BirthDetails = { name: 'Zero', date: '1995-08-20', time: '06:45', timeAccuracy: 'exact', place: chennai }

  it('uses the Lagna when the time is known and the Moon when it is not', () => {
    const known = computeReadings(computeChart(base), new Date('1995-08-20T01:15:00Z'), new Date('2026-10-11'))
    expect(known.personality.source).toBe('lagna')
    expect(known.personality.sign).toBe(4) // Simha rising at a Chennai sunrise in August
    expect(known.partner.sign).toBe(10) // 7th from Simha is Kumbha
    expect(known.partner.lord).toBe('saturn')
    expect(known.marriage).not.toBeNull()

    const unknown = computeReadings(computeChart({ ...base, time: null, timeAccuracy: 'unknown' }), new Date(), new Date())
    expect(unknown.personality.source).toBe('moon')
    expect(unknown.mangal.fromLagna).toBeNull()
    expect(unknown.marriage).toBeNull()
  })

  it('applies the classical Mangal Dosha houses', () => {
    expect(MANGAL_HOUSES).toEqual([1, 2, 4, 7, 8, 12])
    expect(mangalFrom(0, 0)).toEqual({ house: 1, present: true })
    expect(mangalFrom(2, 0)).toEqual({ house: 3, present: false })
    expect(mangalFrom(11, 0)).toEqual({ house: 12, present: true })
  })

  it('lists marriage windows only after age 18 and only for significators', () => {
    const birth = new Date('2000-01-01T00:00:00Z')
    const dashas = vimshottari(0, birth)
    const windows = marriageWindows(dashas, ['venus'], birth, new Date('2016-01-01'))
    expect(windows.length).toBeGreaterThan(0)
    for (const w of windows) {
      expect(w.antar).toBe('venus')
      expect(w.end.getTime()).toBeGreaterThan(new Date('2018-01-01').getTime())
    }
  })

  it('knows the classical sign rulers', () => {
    expect(SIGN_LORD[0]).toBe('mars')
    expect(SIGN_LORD[3]).toBe('moon')
    expect(SIGN_LORD[11]).toBe('jupiter')
  })
})
