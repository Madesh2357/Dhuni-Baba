import type { ReactNode } from 'react'
import styles from './Notice.module.css'

interface NoticeProps {
  title?: string
  tone?: 'info' | 'caution'
  children: ReactNode
  /** Use "status" for messages that appear after an action, so screen readers announce them. */
  role?: 'status' | 'note'
}

/** A calm, bordered message box for disclaimers, pending states and tips. */
export function Notice({ title, tone = 'info', children, role = 'note' }: NoticeProps) {
  return (
    <div className={styles.notice} data-tone={tone} role={role}>
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.body}>{children}</div>
    </div>
  )
}
