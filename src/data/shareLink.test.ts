import { describe, expect, it } from 'vitest'
import { decodeDetails, encodeDetails, shareUrl } from './shareLink'
import type { BirthDetails } from './types'

const DETAILS: BirthDetails = {
  name: 'ஜீரோ Zero',
  date: '1995-08-20',
  time: '06:45',
  timeAccuracy: 'exact',
  place: { label: 'Chennai, Tamil Nadu, India', latitude: 13.0878, longitude: 80.2785, timeZone: 'Asia/Kolkata', source: 'geocoder' },
}

describe('share links', () => {
  it('round-trips details, including non-Latin names', () => {
    expect(decodeDetails(encodeDetails(DETAILS))).toEqual(DETAILS)
  })

  it('puts the data in the fragment, which browsers never send to servers', () => {
    const url = new URL(shareUrl(DETAILS, 'https://dhunibaba.example'))
    expect(url.pathname).toBe('/share')
    expect(url.search).toBe('')
    expect(url.hash.startsWith('#v1.')).toBe(true)
  })

  it('handles unknown birth times', () => {
    const unknown = { ...DETAILS, time: null, timeAccuracy: 'unknown' as const }
    expect(decodeDetails(encodeDetails(unknown))).toEqual(unknown)
  })

  it('rejects malformed, tampered or invalid links', () => {
    expect(decodeDetails('')).toBeNull()
    expect(decodeDetails('#v2.abc')).toBeNull()
    expect(decodeDetails('#v1.not-base64!!')).toBeNull()
    const bad = (patch: object) =>
      'v1.' + btoa(JSON.stringify({ n: 'Z', d: '1995-08-20', t: '06:45', a: 'exact', l: 'X', la: 1, lo: 1, z: 'Asia/Kolkata', s: 'manual', ...patch }))
    expect(decodeDetails(bad({}))).not.toBeNull()
    expect(decodeDetails(bad({ la: 120 }))).toBeNull()
    expect(decodeDetails(bad({ z: 'Mars/Base' }))).toBeNull()
    expect(decodeDetails(bad({ d: '2999-01-01' }))).toBeNull()
    expect(decodeDetails(bad({ n: '' }))).toBeNull()
    expect(decodeDetails(bad({ a: 'certainly' }))).toBeNull()
    expect(decodeDetails(bad({ l: 'x'.repeat(500) }))).toBeNull()
  })
})
