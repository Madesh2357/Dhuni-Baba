import { createContext } from 'react'
import type { LanguageCode } from './languages'
import type { MessageKey } from './locales/en'
import type { TranslateVars } from './translate'

export interface I18nValue {
  language: LanguageCode
  /** BCP-47 locale used for formatting numbers and dates, e.g. "ta-IN". */
  locale: string
  setLanguage: (code: LanguageCode) => void
  t: (key: MessageKey, vars?: TranslateVars) => string
  /** True while a language file is being downloaded. */
  loading: boolean
}

export const I18nContext = createContext<I18nValue | null>(null)
