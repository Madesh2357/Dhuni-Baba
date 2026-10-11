import { createContext } from 'react'
import type { BirthDetails } from './types'

export interface BirthDetailsValue {
  details: BirthDetails | null
  save: (details: BirthDetails) => void
  forget: () => void
}

export const BirthDetailsContext = createContext<BirthDetailsValue | null>(null)
