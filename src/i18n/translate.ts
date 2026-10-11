import type { MessageKey, Messages } from './locales/en'

export type TranslateVars = Record<string, string | number>

/**
 * Look up a message and fill in {placeholders}.
 * Falls back to English if a key is somehow missing, so the UI never shows blanks.
 */
export function translate(
  messages: Messages,
  fallback: Messages,
  key: MessageKey,
  vars?: TranslateVars,
): string {
  const template = messages[key] || fallback[key] || key
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}
