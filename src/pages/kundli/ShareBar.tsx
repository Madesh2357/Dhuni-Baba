import { useState } from 'react'
import { shareUrl } from '../../data/shareLink'
import type { BirthDetails } from '../../data/types'
import { useI18n } from '../../i18n/useI18n'
import styles from './ShareBar.module.css'

type Status = 'idle' | 'copied' | 'manual'

/**
 * "Share" uses the phone's native share sheet when available, otherwise
 * copies the link. "Save as PDF" opens the browser's print dialog, where
 * every modern browser offers Save as PDF — no PDF library needed.
 */
export function ShareBar({ details }: { details: BirthDetails }) {
  const { t } = useI18n()
  const [status, setStatus] = useState<Status>('idle')
  const url = shareUrl(details, window.location.origin)

  async function share() {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ title: 'Dhuni Baba', text: t('share.shareText'), url })
        return
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return // user closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch {
      setStatus('manual')
    }
  }

  return (
    <div className={`${styles.bar} no-print`}>
      <div className={styles.buttons}>
        <button type="button" className="btn" onClick={share}>
          {t('share.button')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          {t('share.print')}
        </button>
      </div>
      <p className={styles.note}>{t('share.warning')}</p>
      <div role="status" aria-live="polite">
        {status === 'copied' && <p className={styles.ok}>{t('share.copied')}</p>}
        {status === 'manual' && (
          <label className={styles.manual}>
            <span>{t('share.copyFailed')}</span>
            <input className="input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
          </label>
        )}
      </div>
    </div>
  )
}
