import styles from './Divider.module.css'

/** A thin gold rule with a small four-pointed star at its centre. */
export function Divider() {
  return (
    <div className={styles.divider} role="presentation">
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
        <path d="M6 0 7 5 12 6 7 7 6 12 5 7 0 6 5 5Z" fill="#D6B36A" />
      </svg>
    </div>
  )
}
