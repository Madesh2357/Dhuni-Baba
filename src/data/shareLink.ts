/**
 * Shareable reading links.
 *
 * The birth details are packed into the URL *fragment* (the part after "#").
 * Browsers never send the fragment to any server, so a shared link works
 * without us storing anything — the data lives only inside the link itself.
 *
 *   https://example.com/share#v1.eyJuIjoiWmVybyIs…
 *
 * Anything decoded from a link is untrusted input, so it goes through the
 * same validation as the birth-details form.
 */
import { isValidTimeZone } from './timezone'
import type { BirthDetails, Place, TimeAccuracy } from './types'
import { validateBirthForm } from './validation'

const VERSION = 'v1'
const MAX_LABEL = 120

/** Compact on-the-wire shape (short keys keep links shorter). */
interface Packed {
  n: string
  d: string
  t: string | null
  a: TimeAccuracy
  l: string
  la: number
  lo: number
  z: string
  s: Place['source']
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): string {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}

export function encodeDetails(details: BirthDetails): string {
  const packed: Packed = {
    n: details.name,
    d: details.date,
    t: details.time,
    a: details.timeAccuracy,
    l: details.place.label,
    la: Math.round(details.place.latitude * 1e4) / 1e4,
    lo: Math.round(details.place.longitude * 1e4) / 1e4,
    z: details.place.timeZone,
    s: details.place.source,
  }
  return `${VERSION}.${toBase64Url(JSON.stringify(packed))}`
}

export function shareUrl(details: BirthDetails, origin: string): string {
  return `${origin}/share#${encodeDetails(details)}`
}

const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Returns validated details, or null for anything malformed or tampered with. */
export function decodeDetails(fragment: string, now: Date = new Date()): BirthDetails | null {
  const raw = fragment.replace(/^#/, '')
  const [version, payload] = raw.split('.', 2)
  if (version !== VERSION || !payload) return null

  let data: Partial<Packed>
  try {
    data = JSON.parse(fromBase64Url(payload))
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null

  const { n, d, t, a, l, la, lo, z, s } = data
  if (!isString(n) || !isString(d) || !isString(l) || !isString(z)) return null
  if (!isNumber(la) || !isNumber(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return null
  if (a !== 'exact' && a !== 'approximate' && a !== 'unknown') return null
  if (t !== null && !isString(t)) return null
  if (s !== 'geocoder' && s !== 'manual') return null
  if (l.length > MAX_LABEL || !isValidTimeZone(z)) return null

  const place: Place = { label: l, latitude: la, longitude: lo, timeZone: z, source: s }
  const result = validateBirthForm(
    {
      name: n,
      date: d,
      time: t ?? '',
      timeAccuracy: a,
      place,
      manualEntry: false,
      latitude: '',
      longitude: '',
      timeZone: '',
    },
    now,
  )
  return result.ok ? result.value : null
}
