import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ChartIllustration } from '../components/ChartIllustration'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Notice } from '../components/Notice'
import { usePageTitle } from '../components/usePageTitle'
import { useBirthDetails } from '../data/useBirthDetails'
import { useI18n } from '../i18n/useI18n'
import styles from './KundliPage.module.css'

// Loaded on demand: the report carries the astronomy engine.
const LoveReport = lazy(() => import('./love/LoveReport'))

export function LovePage() {
  const { t } = useI18n()
  const { details } = useBirthDetails()
  usePageTitle(t('nav.love'))

  if (!details) {
    return (
      <div className={`container ${styles.state}`}>
        <ChartIllustration className={styles.stateArt} />
        <h1>{t('nav.love')}</h1>
        <p className="lead">{t('love.empty')}</p>
        <Link to="/begin" className="btn">
          {t('kundli.emptyCta')}
        </Link>
      </div>
    )
  }

  const failed = (
    <div className={`container ${styles.state}`}>
      <h1>{t('nav.love')}</h1>
      <Notice tone="caution" role="status">
        <p>{t('kundli.calcError')}</p>
      </Notice>
      <Link to="/begin" className="btn">
        {t('kundli.edit')}
      </Link>
    </div>
  )

  const loading = (
    <div className={`container ${styles.state}`} role="status" aria-live="polite">
      <ChartIllustration className={`${styles.stateArt} ${styles.turning}`} />
      <p className="lead">{t('kundli.calculating')}</p>
    </div>
  )

  return (
    <ErrorBoundary key={JSON.stringify(details)} fallback={failed}>
      <Suspense fallback={loading}>
        <LoveReport details={details} />
      </Suspense>
    </ErrorBoundary>
  )
}
