/** Shared data shapes for birth details. No UI code in this folder. */

export type TimeAccuracy = 'exact' | 'approximate' | 'unknown'

/** A place returned by geocoding, or typed in manually. */
export interface Place {
  /** Display label, e.g. "Madurai, Tamil Nadu, India". */
  label: string
  /** WGS84 decimal degrees, north positive. */
  latitude: number
  /** WGS84 decimal degrees, east positive. */
  longitude: number
  /** IANA time-zone name, e.g. "Asia/Kolkata". */
  timeZone: string
  source: 'geocoder' | 'manual'
}

/** Raw values straight from the form inputs (everything is a string). */
export interface BirthFormInput {
  name: string
  date: string // "YYYY-MM-DD" from <input type="date">
  time: string // "HH:MM" from <input type="time">
  timeAccuracy: TimeAccuracy
  place: Place | null // chosen from search results
  manualEntry: boolean
  latitude: string
  longitude: string
  timeZone: string
}

/** Clean, validated birth details used by the rest of the app. */
export interface BirthDetails {
  name: string
  date: string
  /** null when the birth time is unknown — never guessed. */
  time: string | null
  timeAccuracy: TimeAccuracy
  place: Place
}

export type BirthField = 'name' | 'date' | 'time' | 'place' | 'latitude' | 'longitude' | 'timeZone'
