import type { MessageKey } from '../i18n/locales/en'
import { isValidTimeZone, localToUtc } from './timezone'
import type { BirthDetails, BirthField, BirthFormInput } from './types'

export type FieldErrors = Partial<Record<BirthField, MessageKey>>

export type ValidationResult =
  | { ok: true; value: BirthDetails }
  | { ok: false; errors: FieldErrors }

export const MIN_DATE = '1800-01-01'
export const NAME_MAX_LENGTH = 60

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
// Some mobile browsers report seconds ("06:45:00"); we accept and drop them.
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/

/** True if "YYYY-MM-DD" is a real calendar day (rejects 2023-02-30). */
export function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function parseCoordinate(raw: string, limit: number): number | null {
  const text = raw.trim().replace(',', '.').replace('−', '-')
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null
  const value = Number(text)
  return Math.abs(value) <= limit ? value : null
}

/**
 * Check the form and return either clean BirthDetails or a map of
 * field → message key. Pure function: easy to unit-test.
 *
 * @param now injected so tests can pin "today".
 */
export function validateBirthForm(input: BirthFormInput, now: Date = new Date()): ValidationResult {
  const errors: FieldErrors = {}

  const name = input.name.trim()
  if (!name) errors.name = 'error.required'
  else if (name.length > NAME_MAX_LENGTH) errors.name = 'error.nameTooLong'

  const date = input.date.trim()
  if (!date) errors.date = 'error.required'
  else if (!isRealDate(date)) errors.date = 'error.dateInvalid'
  else if (date < MIN_DATE) errors.date = 'error.dateTooOld'

  const timeKnown = input.timeAccuracy !== 'unknown'
  const rawTime = input.time.trim()
  const time = rawTime.slice(0, 5) // "HH:MM"
  if (timeKnown) {
    if (!rawTime) errors.time = 'error.required'
    else if (!TIME_PATTERN.test(rawTime)) errors.time = 'error.timeInvalid'
  }

  let place = input.place
  if (input.manualEntry) {
    const latitude = parseCoordinate(input.latitude, 90)
    const longitude = parseCoordinate(input.longitude, 180)
    const timeZone = input.timeZone.trim()
    if (!input.latitude.trim()) errors.latitude = 'error.required'
    else if (latitude === null) errors.latitude = 'error.latInvalid'
    if (!input.longitude.trim()) errors.longitude = 'error.required'
    else if (longitude === null) errors.longitude = 'error.lonInvalid'
    if (!timeZone) errors.timeZone = 'error.required'
    else if (!isValidTimeZone(timeZone)) errors.timeZone = 'error.tzInvalid'

    place =
      latitude !== null && longitude !== null && !errors.timeZone
        ? {
            label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude,
            timeZone,
            source: 'manual',
          }
        : null
  } else if (!place) {
    errors.place = 'error.placeRequired'
  }

  // Cross-field checks need a valid date and place.
  if (!errors.date && place) {
    const checkTime = timeKnown && !errors.time ? time : '12:00'
    const conversion = localToUtc(date, checkTime, place.timeZone)
    if (conversion.utc.getTime() > now.getTime()) errors.date = 'error.dateFuture'
    else if (timeKnown && !errors.time && conversion.status === 'gap') errors.time = 'error.timeGap'
  } else if (!errors.date && date > now.toISOString().slice(0, 10)) {
    errors.date = 'error.dateFuture'
  }

  if (Object.keys(errors).length > 0 || !place) return { ok: false, errors }

  return {
    ok: true,
    value: {
      name,
      date,
      time: timeKnown ? time : null,
      timeAccuracy: input.timeAccuracy,
      place,
    },
  }
}
