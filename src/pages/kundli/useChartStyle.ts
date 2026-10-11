import { useState } from 'react'
import type { LanguageCode } from '../../i18n/languages'

export type ChartStyle = 'north' | 'south'

const STORAGE_KEY = 'dhuni-baba:chart-style'
// South Indian charts are the everyday format in these languages' regions.
const SOUTH_DEFAULT: LanguageCode[] = ['ta', 'te', 'ml', 'kn']

/** Remembers the chosen chart style on this device (a harmless display preference). */
export function useChartStyle(language: LanguageCode) {
  const [chosen, setChosen] = useState<ChartStyle | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'north' || saved === 'south' ? saved : null
    } catch {
      return null
    }
  })
  const style: ChartStyle = chosen ?? (SOUTH_DEFAULT.includes(language) ? 'south' : 'north')
  const setStyle = (next: ChartStyle) => {
    setChosen(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore: the choice still applies for this visit.
    }
  }
  return [style, setStyle] as const
}
