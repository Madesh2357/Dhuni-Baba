import { Link } from 'react-router-dom'
import { usePageTitle } from '../components/usePageTitle'
import { useI18n } from '../i18n/useI18n'
import styles from './TextPage.module.css'

export function NotFoundPage() {
  const { t } = useI18n()
  usePageTitle(t('notFound.title'))
  return (
    <div className={`container ${styles.page} ${styles.center}`}>
      <p className={styles.bigNumber} aria-hidden="true">404</p>
      <h1>{t('notFound.title')}</h1>
      <p className="lead">{t('notFound.body')}</p>
      <Link to="/" className="btn">
        {t('notFound.cta')}
      </Link>
    </div>
  )
}
