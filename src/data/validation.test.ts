import { describe, expect, it } from 'vitest'
import type { BirthFormInput, Place } from './types'
import { isRealDate, validateBirthForm } from './validation'

const CHENNAI: Place = {
  label: 'Chennai, Tamil Nadu, India',
  latitude: 13.08784,
  longitude: 80.27847,
  timeZone: 'Asia/Kolkata',
  source: 'geocoder',
}

const VALID: BirthFormInput = {
  name: 'Zero',
  date: '1995-08-20',
  time: '06:45',
  timeAccuracy: 'exact',
  place: CHENNAI,
  manualEntry: false,
  latitude: '',
  longitude: '',
  timeZone: '',
}

const NOW = new Date('2026-10-11T12:00:00Z')

describe('validateBirthForm', () => {
  it('accepts a complete, sensible form', () => {
    const result = validateBirthForm(VALID, NOW)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toMatchObject({ name: 'Zero', time: '06:45', place: CHENNAI })
    }
  })

  it('reports every missing required field', () => {
    const result = validateBirthForm({ ...VALID, name: ' ', date: '', time: '', place: null }, NOW)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toEqual({
        name: 'error.required',
        date: 'error.required',
        time: 'error.required',
        place: 'error.placeRequired',
      })
    }
  })

  it('does not require or keep a time when the time is unknown', () => {
    const result = validateBirthForm({ ...VALID, time: '', timeAccuracy: 'unknown' }, NOW)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.time).toBeNull()
  })

  it('rejects future dates and impossible dates', () => {
    const future = validateBirthForm({ ...VALID, date: '2030-01-01' }, NOW)
    expect(!future.ok && future.errors.date).toBe('error.dateFuture')
    const impossible = validateBirthForm({ ...VALID, date: '2023-02-30' }, NOW)
    expect(!impossible.ok && impossible.errors.date).toBe('error.dateInvalid')
    const ancient = validateBirthForm({ ...VALID, date: '1700-01-01' }, NOW)
    expect(!ancient.ok && ancient.errors.date).toBe('error.dateTooOld')
  })

  it('rejects a birth later today that has not happened yet', () => {
    const result = validateBirthForm({ ...VALID, date: '2026-10-11', time: '23:00' }, NOW)
    expect(!result.ok && result.errors.date).toBe('error.dateFuture')
  })

  it('accepts times with seconds, as some phone browsers send them', () => {
    const result = validateBirthForm({ ...VALID, time: '06:45:00' }, NOW)
    expect(result.ok && result.value.time).toBe('06:45')
  })

  it('rejects names that are too long', () => {
    const result = validateBirthForm({ ...VALID, name: 'x'.repeat(61) }, NOW)
    expect(!result.ok && result.errors.name).toBe('error.nameTooLong')
  })

  it('rejects a local time that fell in a daylight-saving gap', () => {
    const nyc: Place = { ...CHENNAI, label: 'New York', timeZone: 'America/New_York' }
    const result = validateBirthForm({ ...VALID, date: '2021-03-14', time: '02:30', place: nyc }, NOW)
    expect(!result.ok && result.errors.time).toBe('error.timeGap')
  })

  describe('manual coordinates', () => {
    const manual = { ...VALID, place: null, manualEntry: true }

    it('accepts valid coordinates and a known time zone', () => {
      const result = validateBirthForm({ ...manual, latitude: '13.0827', longitude: '80,2707', timeZone: 'Asia/Kolkata' }, NOW)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.place).toMatchObject({ latitude: 13.0827, longitude: 80.2707, source: 'manual' })
      }
    })

    it('rejects out-of-range coordinates and unknown zones', () => {
      const result = validateBirthForm({ ...manual, latitude: '91', longitude: 'east', timeZone: 'Moon/Base' }, NOW)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors).toMatchObject({
          latitude: 'error.latInvalid',
          longitude: 'error.lonInvalid',
          timeZone: 'error.tzInvalid',
        })
      }
    })
  })
})

describe('isRealDate', () => {
  it('knows about leap years', () => {
    expect(isRealDate('2024-02-29')).toBe(true)
    expect(isRealDate('2023-02-29')).toBe(false)
    expect(isRealDate('1900-02-29')).toBe(false)
  })
})
