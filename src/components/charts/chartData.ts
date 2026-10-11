import { GRAHA_ORDER, type Chart } from '../../astrology'
import type { AstroNames } from '../../i18n/astroNames'

export interface ChartLabel {
  text: string
  retrograde?: boolean
  /** Gold-highlighted label, used for the Lagna marker. */
  accent?: boolean
}

/** Labels to draw inside each sign (index 0 = Mesha … 11 = Meena). */
export function labelsBySign(chart: Chart, names: AstroNames): ChartLabel[][] {
  const bySign: ChartLabel[][] = Array.from({ length: 12 }, () => [])
  if (chart.ascendant) bySign[chart.ascendant.sign].push({ text: names.lagnaShort, accent: true })
  for (const graha of chart.grahas) {
    bySign[graha.sign].push({
      text: names.grahaShort[GRAHA_ORDER.indexOf(graha.id)],
      retrograde: graha.retrograde,
    })
  }
  return bySign
}

/** The sign counted as house 1: the Lagna, or the Moon's sign when the time is unknown. */
export function referenceSign(chart: Chart): number {
  return chart.ascendant?.sign ?? chart.grahas.find((g) => g.id === 'moon')!.sign
}

/** Split labels into rows of `perRow` for drawing. */
export function rows<T>(items: T[], perRow: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += perRow) out.push(items.slice(i, i + perRow))
  return out
}
