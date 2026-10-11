import { ASTRO_NAMES } from './astroNames'
import { useI18n } from './useI18n'

/** Graha, rashi and nakshatra names in the current language. */
export function useAstroNames() {
  const { language } = useI18n()
  return ASTRO_NAMES[language]
}
