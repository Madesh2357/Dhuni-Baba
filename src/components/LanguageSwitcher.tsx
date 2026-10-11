import { useId } from 'react'
import { LANGUAGES, isLanguageCode } from '../i18n/languages'
import { useI18n } from '../i18n/useI18n'
import styles from './LanguageSwitcher.module.css'

/** A native <select>: accessible, keyboard-friendly and familiar on phones. */
export function LanguageSwitcher() {
  const { t, language, setLanguage, loading } = useI18n()
  const id = useId()

  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className={styles.label}>
        {t('nav.language')}
      </label>
      <select
        id={id}
        className={styles.select}
        value={language}
        aria-busy={loading}
        onChange={(event) => {
          if (isLanguageCode(event.target.value)) setLanguage(event.target.value)
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} lang={lang.code}>
            {lang.nativeName}
            {lang.code !== 'en' ? ` — ${lang.englishName}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
