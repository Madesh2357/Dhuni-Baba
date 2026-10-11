import type { ChartLabel } from './chartData'
import { ChartLabels } from './ChartLabels'
import styles from './Charts.module.css'

/*
 * North Indian (diamond) layout on a 240 × 240 square.
 * Houses are fixed in place — house 1 is the top-centre diamond and they run
 * anticlockwise — while the sign numbers move to match the chart.
 */
const LABEL_POS: [number, number, number][] = [
  // x, y, labels per row
  [120, 56, 3], [60, 20, 3], [22, 60, 2], [56, 120, 3], [22, 180, 2], [60, 222, 3],
  [120, 184, 3], [180, 222, 3], [218, 180, 2], [184, 120, 3], [218, 60, 2], [180, 20, 3],
]
const NUMBER_POS: [number, number][] = [
  [120, 102], [60, 46], [46, 60], [102, 120], [46, 180], [60, 194],
  [120, 138], [180, 194], [194, 180], [138, 120], [194, 60], [180, 46],
]

interface Props {
  /** Sign index (0–11) that sits in house 1. */
  firstSign: number
  bySign: ChartLabel[][]
  label: string
}

export function NorthIndianChart({ firstSign, bySign, label }: Props) {
  return (
    <svg viewBox="-6 -6 252 252" className={styles.chart} role="img" aria-label={label}>
      <rect x="0" y="0" width="240" height="240" className={styles.frame} />
      <path d="M0 0 240 240M240 0 0 240M120 0 240 120 120 240 0 120Z" className={styles.frame} />
      {LABEL_POS.map(([x, y, perRow], house) => {
        const sign = (firstSign + house) % 12
        const [nx, ny] = NUMBER_POS[house]
        return (
          <g key={house}>
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" className={styles.signNumber}>
              {sign + 1}
            </text>
            <ChartLabels labels={bySign[sign]} x={x} y={y} perRow={perRow} />
          </g>
        )
      })}
    </svg>
  )
}
