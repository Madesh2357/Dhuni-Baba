import type { ChartLabel } from './chartData'
import { ChartLabels } from './ChartLabels'
import styles from './Charts.module.css'

/*
 * South Indian layout: a 4 × 4 grid where the *signs* are fixed
 * (Meena top-left, then clockwise) and the Lagna is marked with a
 * diagonal line in its corner.
 */
const CELL = 60
// [row, column] of each sign, Mesha (0) … Meena (11).
const SIGN_CELL: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3],
  [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0],
]

interface Props {
  /** Sign index of the Lagna (or the Moon when the time is unknown). */
  firstSign: number
  bySign: ChartLabel[][]
  label: string
  /** Text written in the empty centre. */
  centreTitle: string
}

export function SouthIndianChart({ firstSign, bySign, label, centreTitle }: Props) {
  return (
    <svg viewBox="-6 -6 252 252" className={styles.chart} role="img" aria-label={label}>
      {SIGN_CELL.map(([row, col], sign) => {
        const x = col * CELL
        const y = row * CELL
        return (
          <g key={sign}>
            <rect x={x} y={y} width={CELL} height={CELL} className={styles.frame} />
            {sign === firstSign && <path d={`M${x} ${y + 16} L${x + 16} ${y}`} className={styles.lagnaMark} />}
            <text x={x + CELL - 6} y={y + CELL - 7} textAnchor="end" className={styles.signNumber}>
              {sign + 1}
            </text>
            <ChartLabels labels={bySign[sign]} x={x + CELL / 2} y={y + CELL / 2 - 2} perRow={2} lineHeight={14} />
          </g>
        )
      })}
      <text x="120" y="120" textAnchor="middle" dominantBaseline="middle" className={styles.centre}>
        {centreTitle}
      </text>
    </svg>
  )
}
