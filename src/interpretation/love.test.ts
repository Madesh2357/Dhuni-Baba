import { describe, expect, it } from 'vitest'
import { computeChart, type Chart } from '../astrology'
import type { BirthDetails } from '../data/types'
import { BASE_SCORE, computeLoveReport, elementOf, romanceBand } from './love'

const chennai = { label: 'Chennai', latitude: 13.0827, longitude: 80.2707, timeZone: 'Asia/Kolkata', source: 'manual' as const }
const base: BirthDetails = { name: 'Zero', date: '1995-08-20', time: '06:45', timeAccuracy: 'exact', place: chennai }
const NOW = new Date('2026-10-12T00:00:00Z')

/** Copy a real chart and move planets around, to test individual rules. */
function tweak(chart: Chart, moves: Partial<Record<string, { sign: number; house?: number; retrograde?: boolean }>>): Chart {
  return {
    ...chart,
    grahas: chart.grahas.map((g) => (moves[g.id] ? { ...g, ...moves[g.id] } : g)),
  }
}

describe('Love & Marriage report', () => {
  const chart = computeChart(base)

  it('builds a full report for a known birth time', () => {
    const r = computeLoveReport(chart, NOW)
    expect(r.index.score).toBeGreaterThanOrEqual(5)
    expect(r.index.score).toBeLessThanOrEqual(99)
    expect(r.index.usedHouses).toBe(true)
    expect(r.marriageType).not.toBeNull()
    expect(r.inLaws).not.toBeNull()
    // Lagna Simha → 10th house is Vrishabha (earth).
    expect(r.inLaws).toEqual({ sign: 1, element: 'earth' })
    // Venus in Simha (fire) → fire love language.
    expect(r.loveLanguage).toBe('fire')
  })

  it('adds up the index from the listed factors, starting at 50', () => {
    const r = computeLoveReport(chart, NOW)
    const sum = BASE_SCORE + r.index.factors.reduce((s, f) => s + f.points, 0)
    expect(r.index.score).toBe(Math.max(5, Math.min(99, sum)))
  })

  it('rewards an exalted Venus and penalises a debilitated one', () => {
    const exalted = computeLoveReport(tweak(chart, { venus: { sign: 11 } }), NOW)
    const debilitated = computeLoveReport(tweak(chart, { venus: { sign: 5 } }), NOW)
    expect(exalted.index.factors.find((f) => f.id === 'venusExalted')?.points).toBe(20)
    expect(debilitated.index.factors.find((f) => f.id === 'venusDebilitated')?.points).toBe(-10)
  })

  it('detects Mars–Venus fight patterns', () => {
    expect(computeLoveReport(tweak(chart, { mars: { sign: 4 }, venus: { sign: 4 } }), NOW).fights).toBe('together')
    expect(computeLoveReport(tweak(chart, { mars: { sign: 10 }, venus: { sign: 4 } }), NOW).fights).toBe('opposite')
    expect(computeLoveReport(tweak(chart, { mars: { sign: 6 }, venus: { sign: 4 } }), NOW).fights).toBe('calm')
  })

  it('calls it love-marriage energy when the 5th and 7th lords share a sign', () => {
    // Simha Lagna: 5th = Dhanu (Jupiter), 7th = Kumbha (Saturn). Put both in Mesha.
    const r = computeLoveReport(tweak(chart, { jupiter: { sign: 0 }, saturn: { sign: 0 } }), NOW)
    expect(r.marriageType).toMatchObject({ kind: 'love', lord5: 'jupiter', lord7: 'saturn' })
  })

  it('skips house-based parts honestly without a birth time', () => {
    const r = computeLoveReport(computeChart({ ...base, time: null, timeAccuracy: 'unknown' }), NOW)
    expect(r.index.usedHouses).toBe(false)
    expect(r.index.factors.some((f) => ['venusAngle', 'venusTrine', 'venusHidden', 'seventhBenefic', 'seventhMalefic'].includes(f.id))).toBe(false)
    expect(r.marriageType).toBeNull()
    expect(r.inLaws).toBeNull()
    expect(r.shaadiAlert).toBeNull()
  })

  it('knows the elements and bands', () => {
    expect([0, 1, 2, 3, 4, 11].map(elementOf)).toEqual(['fire', 'earth', 'air', 'water', 'fire', 'water'])
    expect([20, 45, 70, 90].map(romanceBand)).toEqual(['slowburn', 'steady', 'romantic', 'filmy'])
  })
})
