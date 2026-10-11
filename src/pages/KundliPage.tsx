import { Link, useNavigate } from 'react-router-dom'
import { ChartIllustration } from '../components/ChartIllustration'
import { Notice } from '../components/Notice'
import { usePageTitle } from '../components/usePageTitle'
import { formatOffset, localToUtc } from '../data/timezone'
import type { TimeAccuracy } from '../data/types'
import { useBirthDetails } from '../data/useBirthDetails'
import type { MessageKey } from '../i18n/locales/en'
import { useI18n } from '../i18n/useI18n'
import styles from './KundliPage.module.css'

const ACCURACY_LABEL: Record<TimeAccuracy, MessageKey> = {
  exact: 'form.accuracyExact',
  approximate: 'form.accuracyApprox',
  unknown: 'form.accuracyUnknown',
}

// House numbers only — a demonstration frame must never carry planets.
const DEMO_HOUSES = Array.from({ length: 12 }, (_, i) => String(i + 1))

export function KundliPage() {
  const { t, locale } = useI18n()
  const { details, forget } = useBirthDetails()
  const navigate = useNavigate()
  usePageTitle(t('kundli.title'))

  if (!details) {
    return (
      <div className={`container ${styles.empty}`}>
        <ChartIllustration className={styles.emptyArt} />
        <h1>{t('kundli.emptyTitle')}</h1>
        <p className="lead">{t('kundli.emptyBody')}</p>
        <Link to="/begin" className="btn">
          {t('kundli.emptyCta')}
        </Link>
      </div>
    )
  }

  const { place } = details
  const conversion = details.time ? localToUtc(details.date, details.time, place.timeZone) : null

  // Date-only strings are formatted in UTC so they never shift by a day.
  const dateText = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${details.date}T00:00:00Z`),
  )
  const utcText = conversion
    ? `${new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(conversion.utc)} (${formatOffset(conversion.offsetSeconds)})`
    : t('kundli.timeUnknown')

  const rows: [MessageKey, string][] = [
    ['kundli.fieldName', details.name],
    ['kundli.fieldDate', dateText],
    ['kundli.fieldTime', details.time ?? t('kundli.timeUnknown')],
    ['kundli.fieldAccuracy', t(ACCURACY_LABEL[details.timeAccuracy])],
    ['kundli.fieldPlace', place.label],
    ['kundli.fieldCoords', `${place.latitude.toFixed(4)}°, ${place.longitude.toFixed(4)}°`],
    ['kundli.fieldZone', place.timeZone],
    ['kundli.fieldUtc', utcText],
  ]

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <p className="eyebrow">{t('kundli.title')}</p>
        <h1>{t('kundli.greeting', { name: details.name })}</h1>
        <Notice title={t('kundli.pendingTitle')}>
          <p>{t('kundli.pendingBody')}</p>
        </Notice>
      </header>

      <div className={styles.grid}>
        <figure className={styles.demo}>
          <span className={styles.demoBadge} aria-hidden="true">{t('kundli.demoLabel')}</span>
          <ChartIllustration houseLabels={DEMO_HOUSES} label={t('kundli.demoLabel')} />
          <figcaption className={styles.demoCaption}>{t('kundli.demoLabel')}</figcaption>
        </figure>

        <section className={styles.details} aria-labelledby="details-title">
          <h2 id="details-title" className={styles.detailsTitle}>
            {t('kundli.detailsTitle')}
          </h2>
          <dl className={styles.list}>
            {rows.map(([label, value]) => (
              <div key={label} className={styles.row}>
                <dt>{t(label)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {conversion?.status === 'ambiguous' && (
            <Notice tone="caution">
              <p>{t('kundli.ambiguous')}</p>
            </Notice>
          )}
          <div className={styles.actions}>
            <Link to="/begin" className="btn btn-ghost">
              {t('kundli.edit')}
            </Link>
            <button
              type="button"
              className="btn-text"
              onClick={() => {
                forget()
                navigate('/begin')
              }}
            >
              {t('kundli.forget')}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
