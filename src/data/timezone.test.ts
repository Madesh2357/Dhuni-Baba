import { describe, expect, it } from 'vitest'
import { formatOffset, isValidTimeZone, localToUtc } from './timezone'

describe('localToUtc', () => {
  it('converts Indian Standard Time (UTC+5:30)', () => {
    const result = localToUtc('1990-05-15', '10:30', 'Asia/Kolkata')
    expect(result.utc.toISOString()).toBe('1990-05-15T05:00:00.000Z')
    expect(result.offsetSeconds).toBe(19800)
    expect(result.status).toBe('ok')
  })

  it('applies India’s wartime offset (UTC+6:30) in 1943', () => {
    const result = localToUtc('1943-06-01', '12:00', 'Asia/Kolkata')
    expect(formatOffset(result.offsetSeconds)).toBe('+06:30')
    expect(result.utc.toISOString()).toBe('1943-06-01T05:30:00.000Z')
  })

  it('handles the half-hour-plus-quarter zone of Nepal (UTC+5:45)', () => {
    const result = localToUtc('2000-01-01', '06:00', 'Asia/Kathmandu')
    expect(result.utc.toISOString()).toBe('2000-01-01T00:15:00.000Z')
  })

  it('handles western hemisphere dates crossing midnight', () => {
    const result = localToUtc('2020-01-31', '22:00', 'America/New_York')
    expect(result.utc.toISOString()).toBe('2020-02-01T03:00:00.000Z')
  })

  it('flags a non-existent time during a spring-forward gap', () => {
    const result = localToUtc('2021-03-14', '02:30', 'America/New_York')
    expect(result.status).toBe('gap')
  })

  it('flags an ambiguous time during a fall-back overlap and picks the earlier one', () => {
    const result = localToUtc('2021-11-07', '01:30', 'America/New_York')
    expect(result.status).toBe('ambiguous')
    expect(result.utc.toISOString()).toBe('2021-11-07T05:30:00.000Z') // EDT, UTC−4
  })

  it('uses local mean time before standard time existed', () => {
    const result = localToUtc('1850-01-01', '12:00', 'Asia/Kolkata')
    expect(result.offsetSeconds).not.toBe(19800)
    expect(Math.abs(result.offsetSeconds - 19800)).toBeLessThan(3600)
  })
})

describe('isValidTimeZone', () => {
  it('accepts IANA names and rejects junk', () => {
    expect(isValidTimeZone('Asia/Kolkata')).toBe(true)
    expect(isValidTimeZone('Europe/Paris')).toBe(true)
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false)
    expect(isValidTimeZone('')).toBe(false)
  })
})

describe('formatOffset', () => {
  it('formats positive, negative and second-precision offsets', () => {
    expect(formatOffset(19800)).toBe('+05:30')
    expect(formatOffset(-14400)).toBe('−04:00')
    expect(formatOffset(21208)).toBe('+05:53:28')
  })
})
