import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { BirthDetailsContext } from './BirthDetailsContext'
import type { BirthDetails } from './types'

/**
 * Holds the user's birth details for this visit.
 *
 * Privacy: we use sessionStorage (not localStorage) so the details survive a
 * page refresh but are erased by the browser when the tab is closed. Nothing
 * is ever sent to a server of ours — there is no server.
 */
const STORAGE_KEY = 'dhuni-baba:birth-details'

function readStored(): BirthDetails | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BirthDetails) : null
  } catch {
    return null
  }
}

export function BirthDetailsProvider({ children }: { children: ReactNode }) {
  const [details, setDetails] = useState<BirthDetails | null>(readStored)

  const save = useCallback((next: BirthDetails) => {
    setDetails(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage blocked: details still live in memory for this page view.
    }
  }, [])

  const forget = useCallback(() => {
    setDetails(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing to remove.
    }
  }, [])

  const value = useMemo(() => ({ details, save, forget }), [details, save, forget])
  return <BirthDetailsContext.Provider value={value}>{children}</BirthDetailsContext.Provider>
}
