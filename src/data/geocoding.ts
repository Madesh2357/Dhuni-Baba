import type { Place } from './types'

/**
 * Place search using the Open-Meteo Geocoding API.
 *   Docs:    https://open-meteo.com/en/docs/geocoding-api
 *   Data:    GeoNames (CC BY 4.0) — attribution shown in the footer.
 *   Terms:   free, no API key, for non-commercial use. A commercial
 *            deployment needs an Open-Meteo subscription or another provider.
 *
 * Only the text the user types is sent. No key exists, so nothing secret is
 * shipped to the browser.
 */

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

interface OpenMeteoResult {
  name: string
  latitude: number
  longitude: number
  timezone?: string
  country?: string
  admin1?: string
}

export class GeocodingError extends Error {}

export async function searchPlaces(query: string, language: string, signal?: AbortSignal): Promise<Place[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []
  try {
    return await requestPlaces(trimmed, language, signal)
  } catch (error) {
    // If the service rejects a language code, try once more in English.
    if (language !== 'en' && error instanceof GeocodingError && !signal?.aborted) {
      return requestPlaces(trimmed, 'en', signal)
    }
    throw error
  }
}

async function requestPlaces(trimmed: string, language: string, signal?: AbortSignal): Promise<Place[]> {
  const url = new URL(ENDPOINT)
  url.searchParams.set('name', trimmed)
  url.searchParams.set('count', '8')
  url.searchParams.set('language', language)
  url.searchParams.set('format', 'json')

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (signal?.aborted) throw error // let callers ignore cancelled searches
    throw new GeocodingError('Network error while searching for a place')
  }
  if (!response.ok) throw new GeocodingError(`Geocoding failed with HTTP ${response.status}`)

  const data = (await response.json()) as { results?: OpenMeteoResult[] }
  return (data.results ?? [])
    .filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number' && r.timezone)
    .map((r) => ({
      label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
      latitude: r.latitude,
      longitude: r.longitude,
      timeZone: r.timezone as string,
      source: 'geocoder' as const,
    }))
}
