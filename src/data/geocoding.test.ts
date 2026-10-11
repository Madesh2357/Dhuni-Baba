import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeocodingError, searchPlaces } from './geocoding'

const OK = {
  results: [
    { name: 'Madurai', latitude: 9.919, longitude: 78.119, timezone: 'Asia/Kolkata', country: 'India', admin1: 'Tamil Nadu' },
    { name: 'Nowhere', latitude: 1, longitude: 2 }, // no time zone → dropped
  ],
}

afterEach(() => vi.unstubAllGlobals())

describe('searchPlaces', () => {
  it('maps results and drops entries without a time zone', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(OK))))
    const places = await searchPlaces('Madurai', 'en')
    expect(places).toEqual([
      { label: 'Madurai, Tamil Nadu, India', latitude: 9.919, longitude: 78.119, timeZone: 'Asia/Kolkata', source: 'geocoder' },
    ])
  })

  it('returns nothing for very short queries without calling the network', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    expect(await searchPlaces('M', 'en')).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('retries in English when the chosen language is rejected', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(new Response('bad language', { status: 400 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(OK)))
    vi.stubGlobal('fetch', fetchSpy)
    const places = await searchPlaces('Madurai', 'or')
    expect(places).toHaveLength(1)
    expect(String(fetchSpy.mock.calls[1][0])).toContain('language=en')
  })

  it('reports network failures as GeocodingError', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    await expect(searchPlaces('Madurai', 'en')).rejects.toBeInstanceOf(GeocodingError)
  })
})
