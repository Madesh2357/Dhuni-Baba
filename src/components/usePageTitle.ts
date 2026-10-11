import { useEffect } from 'react'
import { useI18n } from '../i18n/useI18n'

/** Sets the browser tab title, e.g. "Your Kundli · Dhuni Baba". */
export function usePageTitle(title?: string) {
  const { t } = useI18n()
  useEffect(() => {
    document.title = title ? `${title} · Dhuni Baba` : t('meta.title')
  }, [title, t])
}
