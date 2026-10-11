import styles from './Illustration.module.css'

// Centre of each house in a North Indian chart drawn on a 240 × 240 square.
// House 1 (the ascendant) is the top-centre diamond; houses run anticlockwise.
const HOUSE_CENTRES: [number, number][] = [
  [120, 62], [62, 24], [24, 62], [62, 120], [24, 180], [62, 218],
  [120, 180], [180, 218], [218, 180], [180, 120], [218, 62], [180, 24],
]

interface ChartIllustrationProps {
  /** Optional text for each of the 12 houses, in house order. */
  houseLabels?: string[]
  /** Accessible description. Omit to make the chart purely decorative. */
  label?: string
  className?: string
}

/**
 * The North Indian (diamond) Kundli frame inside a ring of 27 nakshatra marks.
 * In Stage 1 it is only ever used as an illustration or a clearly labelled
 * demonstration — never with invented planet positions.
 */
export function ChartIllustration({ houseLabels, label, className }: ChartIllustrationProps) {
  const minor = Array.from({ length: 27 }, (_, i) => (i * 360) / 27)
  const major = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <svg
      viewBox="-72 -72 384 384"
      className={`${styles.art} ${className ?? ''}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g className={styles.faint}>
        <circle cx="120" cy="120" r="184" />
        <circle cx="120" cy="120" r="172" />
        {minor.map((deg) => (
          <line key={`n${deg}`} x1="120" y1="-64" x2="120" y2="-58" transform={`rotate(${deg} 120 120)`} />
        ))}
      </g>
      <g className={styles.gold}>
        {major.map((deg) => (
          <line key={`s${deg}`} x1="120" y1="-64" x2="120" y2="-52" transform={`rotate(${deg} 120 120)`} />
        ))}
      </g>
      <g className={styles.line}>
        <rect x="0" y="0" width="240" height="240" />
        <path d="M0 0 240 240M240 0 0 240M120 0 240 120 120 240 0 120Z" />
      </g>
      {houseLabels && (
        <g className={styles.labels}>
          {HOUSE_CENTRES.map(([x, y], i) => (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
              {houseLabels[i]}
            </text>
          ))}
        </g>
      )}
    </svg>
  )
}
