import { CONVENTIONS, type ConventionStatus } from '../astrology/conventions'
import { Notice } from '../components/Notice'
import { usePageTitle } from '../components/usePageTitle'
import { useI18n } from '../i18n/useI18n'
import styles from './TextPage.module.css'

const STATUS_LABEL: Record<ConventionStatus, string> = {
  active: 'In use now',
  stage2: 'Planned · Stage 2',
  stage3: 'Planned · Stage 3',
}

export function MethodPage() {
  const { t, language } = useI18n()
  usePageTitle(t('method.title'))

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <p className="eyebrow">{t('nav.method')}</p>
        <h1>{t('method.title')}</h1>
        <p className="lead">{t('method.lead')}</p>
        {language !== 'en' && (
          <Notice>
            <p>{t('method.englishNote')}</p>
          </Notice>
        )}
      </header>

      <dl className={styles.conventions} lang="en">
        {CONVENTIONS.map((item) => (
          <div key={item.topic} className={styles.convention}>
            <dt>
              <span className={styles.topic}>{item.topic}</span>
              <span className={styles.status} data-status={item.status}>
                {STATUS_LABEL[item.status]}
              </span>
            </dt>
            <dd>
              <p className={styles.choice}>{item.choice}</p>
              <p className="muted">{item.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.footnote}>{t('disclaimer.full')}</p>
    </div>
  )
}
