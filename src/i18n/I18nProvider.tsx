import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, type I18nValue } from './I18nContext'
import { DEFAULT_LANGUAGE, getLanguage, isLanguageCode, type LanguageCode } from './languages'
import en, { type Messages } from './locales/en'
import { translate } from './translate'

// English ships in the main bundle; every other language is downloaded only
// when someone picks it (Vite turns each file into its own small chunk).
const loaders = import.meta.glob<{ default: Messages }>(['./locales/*.ts', '!./locales/en.ts'])

const STORAGE_KEY = 'dhuni-baba:language'

interface Loaded {
  code: LanguageCode
  messages: Messages
}

const ENGLISH: Loaded = { code: 'en', messages: en }

function readSavedLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguageCode(saved)) return saved
  } catch {
    // Storage can be blocked (private mode, strict settings) — that's fine.
  }
  return DEFAULT_LANGUAGE
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readSavedLanguage)
  const [loaded, setLoaded] = useState<Loaded>(ENGLISH)

  // What is on screen right now. While a new language downloads we keep
  // showing the previous one, so the page never flashes empty.
  const active = language === 'en' ? ENGLISH : loaded
  const loading = active.code !== language

  useEffect(() => {
    if (language === 'en') return
    let cancelled = false
    const load = loaders[`./locales/${language}.ts`]
    load?.()
      .then((module) => !cancelled && setLoaded({ code: language, messages: module.default }))
      // Network hiccup: fall back to English text rather than showing nothing.
      .catch(() => !cancelled && setLoaded({ code: language, messages: en }))
    return () => {
      cancelled = true
    }
  }, [language])

  // Keep <html lang> in sync — screen readers use it to pick a voice.
  useEffect(() => {
    document.documentElement.lang = active.code
  }, [active.code])

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // Ignore storage failures; the choice still applies for this visit.
    }
  }, [])

  const value = useMemo<I18nValue>(
    () => ({
      language,
      locale: getLanguage(active.code).locale,
      setLanguage,
      loading,
      t: (key, vars) => translate(active.messages, en, key, vars),
    }),
    [language, active, setLanguage, loading],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
