import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField } from '../components/FormField'
import { Notice } from '../components/Notice'
import { PlaceField } from '../components/PlaceField'
import { usePageTitle } from '../components/usePageTitle'
import { listTimeZones } from '../data/timezone'
import type { BirthDetails, BirthField, BirthFormInput, TimeAccuracy } from '../data/types'
import { useBirthDetails } from '../data/useBirthDetails'
import { MIN_DATE, NAME_MAX_LENGTH, validateBirthForm, type FieldErrors } from '../data/validation'
import type { MessageKey } from '../i18n/locales/en'
import { useI18n } from '../i18n/useI18n'
import styles from './BirthDetailsPage.module.css'

const EMPTY_FORM: BirthFormInput = {
  name: '',
  date: '',
  time: '',
  timeAccuracy: 'exact',
  place: null,
  manualEntry: false,
  latitude: '',
  longitude: '',
  timeZone: '',
}

/** Turn previously saved details back into form values, for editing. */
function toFormInput(details: BirthDetails | null): BirthFormInput {
  if (!details) return EMPTY_FORM
  const manual = details.place.source === 'manual'
  return {
    name: details.name,
    date: details.date,
    time: details.time ?? '',
    timeAccuracy: details.timeAccuracy,
    place: manual ? null : details.place,
    manualEntry: manual,
    latitude: manual ? String(details.place.latitude) : '',
    longitude: manual ? String(details.place.longitude) : '',
    timeZone: manual ? details.place.timeZone : '',
  }
}

/** Today's date on the user's own calendar, as "YYYY-MM-DD". */
function localToday() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const ACCURACY_OPTIONS: { value: TimeAccuracy; label: MessageKey }[] = [
  { value: 'exact', label: 'form.accuracyExact' },
  { value: 'approximate', label: 'form.accuracyApprox' },
  { value: 'unknown', label: 'form.accuracyUnknown' },
]

// Order matters: the error summary lists fields top to bottom.
const FIELD_ORDER: BirthField[] = ['name', 'date', 'time', 'place', 'latitude', 'longitude', 'timeZone']
const FIELD_IDS: Record<BirthField, string> = {
  name: 'birth-name',
  date: 'birth-date',
  time: 'birth-time',
  place: 'birth-place',
  latitude: 'birth-lat',
  longitude: 'birth-lon',
  timeZone: 'birth-tz',
}

export function BirthDetailsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { details, save } = useBirthDetails()
  usePageTitle(t('form.title'))

  const [form, setForm] = useState<BirthFormInput>(() => toFormInput(details))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  const [timeZones] = useState(listTimeZones)
  const [today] = useState(localToday)

  /** Update one field; once the user has tried to submit, re-check as they type. */
  function update(patch: Partial<BirthFormInput>) {
    const next = { ...form, ...patch }
    setForm(next)
    if (submitted) {
      const result = validateBirthForm(next)
      setErrors(result.ok ? {} : result.errors)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    const result = validateBirthForm(form)
    if (!result.ok) {
      setErrors(result.errors)
      // Move focus to the summary so everyone learns what went wrong.
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setErrors({})
    save(result.value)
    navigate('/kundli')
  }

  function handleReset() {
    setForm(EMPTY_FORM)
    setErrors({})
    setSubmitted(false)
  }

  const errorFields = FIELD_ORDER.filter((field) => errors[field])
  const err = (field: BirthField) => (errors[field] ? t(errors[field]) : undefined)
  const labelFor: Record<BirthField, MessageKey> = {
    name: 'form.nameLabel',
    date: 'form.dateLabel',
    time: 'form.timeLabel',
    place: 'form.placeLabel',
    latitude: 'form.latLabel',
    longitude: 'form.lonLabel',
    timeZone: 'form.tzLabel',
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.intro}>
        <p className="eyebrow">{t('nav.begin')}</p>
        <h1>{t('form.title')}</h1>
        <p className="lead">{t('form.lead')}</p>
        <Notice>
          <p>{t('disclaimer.short')}</p>
        </Notice>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {errorFields.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} className={styles.summary} role="alert">
            <p className={styles.summaryTitle}>{t('form.errorSummary', { count: errorFields.length })}</p>
            <ul>
              {errorFields.map((field) => (
                <li key={field}>
                  <a href={`#${FIELD_IDS[field]}`}>
                    {t(labelFor[field])}: {err(field)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <fieldset className={styles.group}>
          <legend className="visually-hidden">{t('form.nameLabel')}</legend>
          <FormField id={FIELD_IDS.name} label={t('form.nameLabel')} hint={t('form.nameHint')} error={err('name')}>
            {(control) => (
              <input
                {...control}
                className="input"
                type="text"
                autoComplete="given-name"
                maxLength={NAME_MAX_LENGTH + 10}
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            )}
          </FormField>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>{t('form.dateLabel')} &amp; {t('form.timeLabel')}</legend>
          <div className={styles.row}>
            <FormField id={FIELD_IDS.date} label={t('form.dateLabel')} error={err('date')}>
              {(control) => (
                <input
                  {...control}
                  className="input"
                  type="date"
                  min={MIN_DATE}
                  max={today}
                  value={form.date}
                  onChange={(e) => update({ date: e.target.value })}
                />
              )}
            </FormField>
            {form.timeAccuracy !== 'unknown' && (
              <FormField id={FIELD_IDS.time} label={t('form.timeLabel')} hint={t('form.timeHint')} error={err('time')}>
                {(control) => (
                  <input
                    {...control}
                    className="input"
                    type="time"
                    step={60}
                    value={form.time}
                    onChange={(e) => update({ time: e.target.value })}
                  />
                )}
              </FormField>
            )}
          </div>

          <div className={styles.radioGroup} role="radiogroup" aria-labelledby="accuracy-label">
            <p id="accuracy-label" className={styles.radioLabel}>
              {t('form.accuracyLabel')}
            </p>
            {ACCURACY_OPTIONS.map((option) => (
              <label key={option.value} className={styles.radio}>
                <input
                  type="radio"
                  name="timeAccuracy"
                  value={option.value}
                  checked={form.timeAccuracy === option.value}
                  onChange={() => update({ timeAccuracy: option.value })}
                />
                <span>{t(option.label)}</span>
              </label>
            ))}
          </div>
          {form.timeAccuracy === 'unknown' && (
            <Notice>
              <p>{t('form.unknownNote')}</p>
            </Notice>
          )}
          {form.timeAccuracy === 'approximate' && (
            <Notice>
              <p>{t('form.approxNote')}</p>
            </Notice>
          )}
        </fieldset>

        <fieldset className={styles.group}>
          <legend className="visually-hidden">{t('form.placeLabel')}</legend>
          <PlaceField
            form={form}
            update={update}
            errors={{ place: err('place'), latitude: err('latitude'), longitude: err('longitude'), timeZone: err('timeZone') }}
            ids={FIELD_IDS}
            timeZones={timeZones}
          />
        </fieldset>

        <p className={styles.privacy}>{t('form.privacy')}</p>

        <div className={styles.actions}>
          <button type="submit" className="btn">
            {t('form.submit')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            {t('form.reset')}
          </button>
        </div>
      </form>
    </div>
  )
}
