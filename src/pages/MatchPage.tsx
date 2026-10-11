import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { computeChart, type Chart } from '../astrology'
import { FormField } from '../components/FormField'
import { Notice } from '../components/Notice'
import { PlaceField } from '../components/PlaceField'
import { usePageTitle } from '../components/usePageTitle'
import { listTimeZones } from '../data/timezone'
import type { BirthDetails, BirthField, BirthFormInput } from '../data/types'
import { useBirthDetails } from '../data/useBirthDetails'
import { MIN_DATE, validateBirthForm, type FieldErrors } from '../data/validation'
import { gunaMilan, mangalFrom, matchBand, type GunaMilan, type MoonPlacement } from '../interpretation'
import type { MessageKey } from '../i18n/locales/en'
import { useAstroNames } from '../i18n/useAstroNames'
import { useI18n } from '../i18n/useI18n'
import styles from './MatchPage.module.css'

const EMPTY: BirthFormInput = {
  name: '', date: '', time: '', timeAccuracy: 'unknown',
  place: null, manualEntry: false, latitude: '', longitude: '', timeZone: '',
}

const IDS: Record<BirthField, string> = {
  name: 'partner-name', date: 'partner-date', time: 'partner-time', place: 'partner-place',
  latitude: 'partner-lat', longitude: 'partner-lon', timeZone: 'partner-tz',
}

const BAND_KEY = { low: 'match.verdictLow', ok: 'match.verdictOk', good: 'match.verdictGood', great: 'match.verdictGreat' } as const

interface Person {
  name: string
  chart: Chart
}

interface Result {
  milan: GunaMilan
  you: Person
  partner: Person
}

function moonOf(chart: Chart): MoonPlacement {
  const moon = chart.grahas.find((g) => g.id === 'moon')!
  return { longitude: moon.longitude, sign: moon.sign, nakshatra: moon.nakshatra }
}

/** Mangal Dosha from the Lagna, or null when the birth time is unknown. */
function hasMangal(chart: Chart): boolean | null {
  if (!chart.ascendant) return null
  const mars = chart.grahas.find((g) => g.id === 'mars')!
  return mangalFrom(mars.sign, chart.ascendant.sign).present
}

export default function MatchPage() {
  const { t, locale } = useI18n()
  const names = useAstroNames()
  const { details } = useBirthDetails()
  usePageTitle(t('match.title'))

  const [form, setForm] = useState<BirthFormInput>(EMPTY)
  const [role, setRole] = useState<'mine' | 'partner'>('mine')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [failed, setFailed] = useState(false)
  const [timeZones] = useState(listTimeZones)
  const resultRef = useRef<HTMLDivElement>(null)

  if (!details) {
    return (
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <p className="eyebrow">{t('nav.match')}</p>
          <h1>{t('match.title')}</h1>
          <p className="lead">{t('match.lead')}</p>
        </header>
        <Notice>
          <p>{t('match.youMissing')}</p>
        </Notice>
        <p className={styles.spaced}>
          <Link to="/begin" className="btn">{t('kundli.emptyCta')}</Link>
        </p>
      </div>
    )
  }

  // The partner's time is optional: empty means "unknown" (local noon, flagged).
  const asInput = (f: BirthFormInput): BirthFormInput => ({ ...f, timeAccuracy: f.time.trim() ? 'exact' : 'unknown' })

  function update(patch: Partial<BirthFormInput>) {
    const next = { ...form, ...patch }
    setForm(next)
    if (submitted) {
      const check = validateBirthForm(asInput(next))
      setErrors(check.ok ? {} : check.errors)
    }
  }

  function compute(partnerDetails: BirthDetails, chosenRole: 'mine' | 'partner') {
    try {
      const you = { name: details!.name, chart: computeChart(details!) }
      const partner = { name: partnerDetails.name, chart: computeChart(partnerDetails) }
      const [groom, bride] = chosenRole === 'mine' ? [you, partner] : [partner, you]
      setResult({ milan: gunaMilan(moonOf(groom.chart), moonOf(bride.chart)), you, partner })
      setFailed(false)
      requestAnimationFrame(() => resultRef.current?.focus())
    } catch (error) {
      console.error(error)
      setFailed(true)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    const check = validateBirthForm(asInput(form))
    if (!check.ok) {
      setErrors(check.errors)
      return
    }
    setErrors({})
    compute(check.value, role)
  }

  const err = (field: BirthField) => (errors[field] ? t(errors[field]) : undefined)
  const dateText = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${details.date}T00:00:00Z`),
  )

  const basis = (p: Person) => {
    const moon = p.chart.grahas.find((g) => g.id === 'moon')!
    return t('match.basis', { name: p.name, sign: names.signs[moon.sign], nakshatra: names.nakshatras[moon.nakshatra] })
  }
  const uncertain = (p: Person) =>
    p.chart.uncertainty.basis === 'noon' &&
    (p.chart.uncertainty.moonNakshatraMayChange || p.chart.uncertainty.moonSignMayChange)

  let mangalNote: MessageKey | null = null
  if (result) {
    const a = hasMangal(result.you.chart)
    const b = hasMangal(result.partner.chart)
    if (a !== null && b !== null) mangalNote = a && b ? 'match.mangalBoth' : a || b ? 'match.mangalOne' : 'match.mangalNone'
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <p className="eyebrow">{t('nav.match')}</p>
        <h1>{t('match.title')}</h1>
        <p className="lead">{t('match.lead')}</p>
        <Notice>
          <p>{t('disclaimer.short')}</p>
        </Notice>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.group}>
            <h2 className={styles.groupTitle}>{t('match.youTitle')}</h2>
            <p className={styles.small}>
              {t('match.youUsing', { name: details.name, date: dateText })}{' '}
              <Link to="/begin">{t('kundli.edit')}</Link>
            </p>
          </section>

          <fieldset className={styles.group}>
            <legend className={styles.groupTitle}>{t('match.partnerTitle')}</legend>
            <FormField id={IDS.name} label={t('match.partnerName')} error={err('name')}>
              {(control) => (
                <input {...control} className="input" type="text" autoComplete="off" value={form.name} onChange={(e) => update({ name: e.target.value })} />
              )}
            </FormField>
            <div className={styles.row}>
              <FormField id={IDS.date} label={t('form.dateLabel')} error={err('date')}>
                {(control) => (
                  <input {...control} className="input" type="date" min={MIN_DATE} value={form.date} onChange={(e) => update({ date: e.target.value })} />
                )}
              </FormField>
              <FormField id={IDS.time} label={t('match.timeOptional')} hint={t('match.timeOptionalHint')} error={err('time')}>
                {(control) => (
                  <input {...control} className="input" type="time" step={60} value={form.time} onChange={(e) => update({ time: e.target.value })} />
                )}
              </FormField>
            </div>
            <PlaceField
              form={form}
              update={update}
              errors={{ place: err('place'), latitude: err('latitude'), longitude: err('longitude'), timeZone: err('timeZone') }}
              ids={IDS}
              timeZones={timeZones}
            />
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.radioLegend}>{t('match.roleLabel')}</legend>
            {(['mine', 'partner'] as const).map((option) => (
              <label key={option} className={styles.radio}>
                <input
                  type="radio"
                  name="role"
                  value={option}
                  checked={role === option}
                  onChange={() => {
                    setRole(option)
                    // Re-score straight away if a result is already showing.
                    if (result) {
                      const check = validateBirthForm(asInput(form))
                      if (check.ok) compute(check.value, option)
                    }
                  }}
                />
                <span>{t(option === 'mine' ? 'match.roleMine' : 'match.rolePartner')}</span>
              </label>
            ))}
            <p className={styles.small}>{t('match.roleHint')}</p>
          </fieldset>

          {Object.keys(errors).length > 0 && (
            <p className={styles.errorLine} role="alert">
              {t('form.errorSummary', { count: Object.keys(errors).length })}
            </p>
          )}

          <div>
            <button type="submit" className="btn">{t('match.submit')}</button>
          </div>
        </form>

        <div ref={resultRef} tabIndex={-1} className={styles.resultArea} aria-live="polite">
          {failed && (
            <Notice tone="caution" role="status">
              <p>{t('kundli.calcError')}</p>
            </Notice>
          )}
          {result && (
            <section className={styles.result} aria-labelledby="match-score">
              <p id="match-score" className={styles.score}>
                <span className={styles.scoreNumber}>{result.milan.total}</span>
                <span className={styles.scoreMax}>/36</span>
              </p>
              <p className={styles.verdict}>{t(BAND_KEY[matchBand(result.milan.total)], { score: result.milan.total })}</p>

              <ul className={styles.basisList}>
                <li>{basis(result.you)}</li>
                <li>{basis(result.partner)}</li>
              </ul>
              {[result.you, result.partner].filter(uncertain).map((p) => (
                <Notice key={p.name} tone="caution">
                  <p>{t('match.uncertain', { name: p.name })}</p>
                </Notice>
              ))}

              <ol className={styles.kootas}>
                {result.milan.kootas.map((k) => (
                  <li key={k.id} className={styles.koota} data-zero={k.score === 0}>
                    <div>
                      <p className={styles.kootaName}>{t(`match.k.${k.id}` as MessageKey)}</p>
                      <p className={styles.kootaDesc}>{t(`match.kd.${k.id}` as MessageKey)}</p>
                    </div>
                    <p className={styles.kootaScore}>
                      {k.score}
                      <span>/{k.max}</span>
                    </p>
                  </li>
                ))}
                <li className={`${styles.koota} ${styles.totalRow}`}>
                  <p className={styles.kootaName}>{t('match.total')}</p>
                  <p className={styles.kootaScore}>
                    {result.milan.total}
                    <span>/36</span>
                  </p>
                </li>
              </ol>

              <div className={styles.notes}>
                {result.milan.nadiDosha && <Notice tone="caution"><p>{t('match.nadiDosha')}</p></Notice>}
                {result.milan.bhakootDosha && <Notice tone="caution"><p>{t('match.bhakootDosha')}</p></Notice>}
                {mangalNote && <Notice><p>{t(mangalNote)}</p></Notice>}
              </div>
              <p className={styles.small}>{t('match.tablesNote')}</p>
              <p className={styles.small}>{t('read.disclaimer')}</p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setResult(null)
                  setForm(EMPTY)
                  setSubmitted(false)
                }}
              >
                {t('match.again')}
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
