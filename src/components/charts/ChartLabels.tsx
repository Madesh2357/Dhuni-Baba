import { Fragment } from 'react'
import type { ChartLabel } from './chartData'
import { rows } from './chartData'
import styles from './Charts.module.css'

interface Props {
  labels: ChartLabel[]
  x: number
  y: number
  perRow: number
  lineHeight?: number
}

const RAISE = 4

/** A centred block of planet labels; retrograde planets get a small raised "R". */
export function ChartLabels({ labels, x, y, perRow, lineHeight = 15 }: Props) {
  const lines = rows(labels, perRow)
  const top = y - ((lines.length - 1) * lineHeight) / 2
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={top + i * lineHeight} textAnchor="middle" dominantBaseline="middle" className={styles.planet}>
          {line.map((label, j) => (
            <Fragment key={j}>
              {/* The space before a label also drops the baseline back after a raised "R". */}
              {j > 0 && <tspan dy={line[j - 1].retrograde ? RAISE : undefined}> </tspan>}
              <tspan className={label.accent ? styles.accent : undefined}>{label.text}</tspan>
              {label.retrograde && (
                <tspan className={styles.retro} dy={-RAISE}>
                  R
                </tspan>
              )}
            </Fragment>
          ))}
        </text>
      ))}
    </>
  )
}
