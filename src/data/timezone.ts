/**
 * Convert a local civil date/time at a place into Universal Time (UTC).
 *
 * We rely on the IANA time-zone database built into every modern browser
 * (exposed through `Intl.DateTimeFormat`). It knows historical rules such as
 * India's 1942–45 war time and pre-1906 local mean times, plus every
 * daylight-saving change. No extra library is needed.
 */

export type LocalTimeStatus =
  | 'ok'
  | 'ambiguous' // the wall-clock time happened twice (clocks went back)
  | 'gap' //       the wall-clock time never happened (clocks jumped forward)

export interface UtcConversion {
  utc: Date
  /** Offset from UTC in seconds at that instant (IST = 19800). */
  offsetSeconds: number
  status: LocalTimeStatus
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone.trim()) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(timeZone: string) {
  let formatter = formatterCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
    formatterCache.set(timeZone, formatter)
  }
  return formatter
}

/** The wall-clock reading in `timeZone` at instant `ms`, expressed as if it were UTC. */
function wallClockAsUtcMs(ms: number, timeZone: string): number {
  const parts = getFormatter(timeZone).formatToParts(new Date(ms))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)
  const date = new Date(0)
  date.setUTCFullYear(get('year'), get('month') - 1, get('day'))
  date.setUTCHours(get('hour'), get('minute'), get('second'), 0)
  return date.getTime()
}

/** Offset (ms) between local wall-clock time and UTC at a given instant. */
function offsetAt(ms: number, timeZone: string): number {
  const wholeSecond = Math.floor(ms / 1000) * 1000
  return wallClockAsUtcMs(wholeSecond, timeZone) - wholeSecond
}

/**
 * @param date "YYYY-MM-DD"
 * @param time "HH:MM" (24-hour)
 * @param timeZone IANA name such as "Asia/Kolkata"
 */
export function localToUtc(date: string, time: string, timeZone: string): UtcConversion {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)

  // The target wall-clock reading, pretending it is UTC.
  const target = new Date(0)
  target.setUTCFullYear(year, month - 1, day)
  target.setUTCHours(hour, minute, 0, 0)
  const wall = target.getTime()

  // Offsets just before and after any nearby clock change.
  const HALF_DAY = 12 * 3600 * 1000
  const candidateOffsets = [...new Set([offsetAt(wall - HALF_DAY, timeZone), offsetAt(wall + HALF_DAY, timeZone)])]

  const matches = candidateOffsets
    .map((offset) => wall - offset)
    .filter((instant) => wallClockAsUtcMs(instant, timeZone) === wall)
    .sort((a, b) => a - b)

  if (matches.length === 0) {
    // Non-existent local time: interpret with the offset in force before the jump
    // (the same convention JavaScript's Temporal API calls "compatible").
    const before = offsetAt(wall - HALF_DAY, timeZone)
    const instant = wall - before
    return { utc: new Date(instant), offsetSeconds: before / 1000, status: 'gap' }
  }

  const instant = matches[0] // earlier occurrence if ambiguous
  return {
    utc: new Date(instant),
    offsetSeconds: (wall - instant) / 1000,
    status: matches.length > 1 ? 'ambiguous' : 'ok',
  }
}

/** 19800 → "+05:30"; local mean time keeps its seconds, e.g. "+05:53:28". */
export function formatOffset(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? '−' : '+'
  const abs = Math.abs(offsetSeconds)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${sign}${pad(h)}:${pad(m)}${s ? `:${pad(s)}` : ''}`
}

/** All IANA zones the browser knows, for the manual-entry suggestions list. */
export function listTimeZones(): string[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
  try {
    return intl.supportedValuesOf?.('timeZone') ?? []
  } catch {
    return []
  }
}
