import { useContext } from 'react'
import { BirthDetailsContext } from './BirthDetailsContext'

export function useBirthDetails() {
  const value = useContext(BirthDetailsContext)
  if (!value) throw new Error('useBirthDetails must be used inside <BirthDetailsProvider>')
  return value
}
