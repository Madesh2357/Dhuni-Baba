import { describe, expect, it } from 'vitest'
import { LANGUAGES } from './languages'
import en from './locales/en'

const modules = import.meta.glob<{ default: Record<string, string> }>('./locales/*.ts', { eager: true })
const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort()

describe('translations', () => {
  it('has a locale file for every listed language', () => {
    for (const { code } of LANGUAGES) {
      expect(modules[`./locales/${code}.ts`], `missing locales/${code}.ts`).toBeDefined()
    }
  })

  for (const { code } of LANGUAGES) {
    it(`${code}: has every key, no blanks, and the same {placeholders}`, () => {
      const messages = modules[`./locales/${code}.ts`].default
      for (const [key, english] of Object.entries(en)) {
        const text = messages[key]
        expect(text, `${code} is missing "${key}"`).toBeTruthy()
        expect(placeholders(text), `${code} "${key}" placeholders`).toEqual(placeholders(english))
      }
      expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort())
    })
  }

  it('every translation repeats the "do not take astrology seriously" disclaimer', () => {
    for (const { code } of LANGUAGES) {
      const messages = modules[`./locales/${code}.ts`].default
      expect(messages['disclaimer.short']).toMatch(/!!!$/)
    }
  })
})
