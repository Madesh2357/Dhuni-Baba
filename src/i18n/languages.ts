/** The languages Dhuni Baba speaks. Add a new one here and in ./locales. */
export const LANGUAGES = [
  { code: 'en', nativeName: 'English', englishName: 'English', locale: 'en-IN' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', locale: 'ta-IN' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', locale: 'te-IN' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', locale: 'hi-IN' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', locale: 'ml-IN' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', locale: 'kn-IN' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', locale: 'or-IN' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', locale: 'bn-IN' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', locale: 'mr-IN' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', locale: 'pa-IN' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', locale: 'fr-FR' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: LanguageCode = 'en'

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some((lang) => lang.code === value)
}

export function getLanguage(code: LanguageCode) {
  return LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[0]
}
