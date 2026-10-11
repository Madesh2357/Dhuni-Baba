import { useEffect, useId, useRef, useState } from 'react'
import { searchPlaces } from '../data/geocoding'
import type { Place } from '../data/types'
import { useI18n } from '../i18n/useI18n'
import type { FieldControlProps } from './FormField'
import styles from './PlaceSearch.module.css'

type Status = 'idle' | 'loading' | 'done' | 'error'

interface PlaceSearchProps {
  value: Place | null
  onChange: (place: Place | null) => void
  control: FieldControlProps
  /** Injected in tests; defaults to the real Open-Meteo search. */
  search?: typeof searchPlaces
}

const DEBOUNCE_MS = 450

/**
 * Type-to-search for a birthplace. Results are plain buttons in a list, which
 * keeps keyboard and screen-reader behaviour simple and predictable.
 */
export function PlaceSearch({ value, onChange, control, search = searchPlaces }: PlaceSearchProps) {
  const { t, language } = useI18n()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [results, setResults] = useState<Place[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const statusId = useId()

  // Only search while nothing is selected and at least two letters are typed.
  const active = !value && query.trim().length >= 2

  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setStatus('loading')
      search(query, language, controller.signal)
        .then((places) => {
          setResults(places)
          setStatus('done')
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus('error')
        })
    }, DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [active, query, language, search])

  if (value) {
    return (
      <div className={styles.selected}>
        <p className={styles.selectedLabel}>{t('form.placeSelected')}</p>
        <p className={styles.selectedName}>{value.label}</p>
        <p className={styles.selectedMeta}>
          {value.latitude.toFixed(4)}°, {value.longitude.toFixed(4)}° · {value.timeZone}
        </p>
        <button
          type="button"
          className="btn-text"
          onClick={() => {
            onChange(null)
            // Wait for the input to re-appear, then focus it.
            requestAnimationFrame(() => inputRef.current?.focus())
          }}
        >
          {t('form.placeChange')}
        </button>
      </div>
    )
  }

  let message = ''
  if (!active) message = ''
  else if (status === 'loading') message = t('form.placeSearching')
  else if (status === 'error') message = t('form.placeError')
  else if (status === 'done') message = results.length ? t('form.placeResults', { count: results.length }) : t('form.placeNoResults')

  return (
    <div>
      <input
        {...control}
        ref={inputRef}
        className="input"
        type="search"
        autoComplete="off"
        value={query}
        aria-describedby={[control['aria-describedby'], statusId].filter(Boolean).join(' ')}
        onChange={(event) => setQuery(event.target.value)}
        // Enter inside the search box must not submit the whole form.
        onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
      />
      <p id={statusId} className={styles.status} role="status" data-tone={status}>
        {active && status === 'loading' && <span className={styles.spinner} aria-hidden="true" />}
        {message}
      </p>
      {active && status === 'done' && results.length > 0 && (
        <ul className={styles.results}>
          {results.map((place) => (
            <li key={`${place.label}-${place.latitude}-${place.longitude}`}>
              <button type="button" className={styles.result} onClick={() => onChange(place)}>
                <span className={styles.resultName}>{place.label}</span>
                <span className={styles.resultMeta}>
                  {place.latitude.toFixed(2)}°, {place.longitude.toFixed(2)}° · {place.timeZone}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
