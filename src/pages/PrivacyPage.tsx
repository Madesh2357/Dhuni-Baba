import { useState } from 'react'
import { Notice } from '../components/Notice'
import { usePageTitle } from '../components/usePageTitle'
import { useBirthDetails } from '../data/useBirthDetails'
import type { MessageKey } from '../i18n/locales/en'
import { useI18n } from '../i18n/useI18n'
import styles from './TextPage.module.css'

const POINTS: MessageKey[] = ['privacy.point1', 'privacy.point2', 'privacy.point3', 'privacy.point4', 'privacy.point5', 'privacy.point6']

export function PrivacyPage() {
  const { t } = useI18n()
  const { details, forget } = useBirthDetails()
  const [forgotten, setForgotten] = useState(false)
  usePageTitle(t('privacy.title'))

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <p className="eyebrow">{t('nav.privacy')}</p>
        <h1>{t('privacy.title')}</h1>
        <p className="lead">{t('privacy.lead')}</p>
      </header>

      <ol className={styles.points}>
        {POINTS.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ol>

      <div className={styles.forget}>
        {details && !forgotten && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              forget()
              setForgotten(true)
            }}
          >
            {t('privacy.forgetNow')}
          </button>
        )}
        {forgotten && (
          <Notice role="status">
            <p>{t('privacy.forgotten')}</p>
          </Notice>
        )}
      </div>
    </div>
  )
}
