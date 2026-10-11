import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import styles from './Footer.module.css'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.disclaimer}>
          <strong>{t('disclaimer.short')}</strong> {t('disclaimer.full')}
        </p>
        <div className={styles.meta}>
          <p className={styles.credits}>{t('footer.credits')}</p>
          <nav aria-label="Footer" className={styles.links}>
            <Link to="/method">{t('nav.method')}</Link>
            <Link to="/privacy">{t('nav.privacy')}</Link>
          </nav>
        </div>
        <p className={styles.copy}>© {YEAR} Dhuni Baba</p>
      </div>
    </footer>
  )
}
