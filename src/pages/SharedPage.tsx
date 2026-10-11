import { lazy, Suspense, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChartIllustration } from '../components/ChartIllustration'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Notice } from '../components/Notice'
import { usePageTitle } from '../components/usePageTitle'
import { decodeDetails } from '../data/shareLink'
import { useI18n } from '../i18n/useI18n'
import styles from './KundliPage.module.css'

const KundliDashboard = lazy(() => import('./kundli/KundliDashboard'))

/**
 * Opens a reading from a share link (/share#v1.…). The details are decoded
 * from the URL fragment in the browser and are NOT saved anywhere.
 */
export function SharedPage() {
  const { t } = useI18n()
  const { hash } = useLocation()
  const details = useMemo(() => decodeDetails(hash), [hash])
  usePageTitle(t('share.sharedTitle'))

  if (!details) {
    return (
      <div className={`container ${styles.state}`}>
        <ChartIllustration className={styles.stateArt} />
        <h1>{t('share.invalidTitle')}</h1>
        <p className="lead">{t('share.invalidBody')}</p>
        <Link to="/begin" className="btn">{t('share.makeMine')}</Link>
      </div>
    )
  }

  const failed = (
    <div className={`container ${styles.state}`}>
      <Notice tone="caution" role="status"><p>{t('kundli.calcError')}</p></Notice>
      <Link to="/begin" className="btn">{t('share.makeMine')}</Link>
    </div>
  )
  const loading = (
    <div className={`container ${styles.state}`} role="status" aria-live="polite">
      <ChartIllustration className={`${styles.stateArt} ${styles.turning}`} />
      <p className="lead">{t('kundli.calculating')}</p>
    </div>
  )

  return (
    <ErrorBoundary key={hash} fallback={failed}>
      <Suspense fallback={loading}>
        <KundliDashboard details={details} mode="shared" />
      </Suspense>
    </ErrorBoundary>
  )
}
