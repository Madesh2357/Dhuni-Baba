import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { computeChart, GRAHA_ORDER, periodAt, toDegreesMinutes, type GrahaId, type ZodiacPoint } from '../../astrology'
import { labelsBySign, referenceSign } from '../../components/charts/chartData'
import { NorthIndianChart } from '../../components/charts/NorthIndianChart'
import { SouthIndianChart } from '../../components/charts/SouthIndianChart'
import { Notice } from '../../components/Notice'
import { formatOffset, localToUtc } from '../../data/timezone'
import type { BirthDetails, TimeAccuracy } from '../../data/types'
import { useBirthDetails } from '../../data/useBirthDetails'
import type { MessageKey } from '../../i18n/locales/en'
import { useAstroNames } from '../../i18n/useAstroNames'
import { useI18n } from '../../i18n/useI18n'
import styles from './KundliDashboard.module.css'
import { ReadingsSection } from './ReadingsSection'
import { useChartStyle } from './useChartStyle'

const ACCURACY_LABEL: Record<TimeAccuracy, MessageKey> = {
  exact: 'form.accuracyExact',
  approximate: 'form.accuracyApprox',
  unknown: 'form.accuracyUnknown',
}

function formatDegrees(value: number) {
  const { degrees, minutes } = toDegreesMinutes(value)
  return `${degrees}°${String(minutes).padStart(2, '0')}′`
}

/** The full Kundli for one person. Loaded on demand (it carries the astronomy engine). */
export default function KundliDashboard({ details }: { details: BirthDetails }) {
  const { t, locale, language } = useI18n()
  const names = useAstroNames()
  const { forget } = useBirthDetails()
  const navigate = useNavigate()
  const [style, setStyle] = useChartStyle(language)
  const [now] = useState(() => new Date())

  // Any error thrown here is caught by the ErrorBoundary in KundliPage.
  const chart = useMemo(() => computeChart(details), [details])

  const grahaName = (id: GrahaId) => names.grahas[GRAHA_ORDER.indexOf(id)]
  const moon = chart.grahas.find((g) => g.id === 'moon')!
  const sun = chart.grahas.find((g) => g.id === 'sun')!
  const { uncertainty } = chart
  const bySign = labelsBySign(chart, names)
  const firstSign = referenceSign(chart)
  const chartTitle = chart.ascendant ? t('kundli.chartTitle') : t('kundli.chartMoonTitle')

  const pointText = (p: ZodiacPoint) => `${formatDegrees(p.degreeInSign)} · ${names.nakshatras[p.nakshatra]}`
  const facts: { label: MessageKey; value: string; detail: string; uncertain?: boolean }[] = [
    chart.ascendant
      ? {
          label: 'kundli.lagna',
          value: names.signs[chart.ascendant.sign],
          detail: pointText(chart.ascendant),
          uncertain: uncertainty.ascendantSignMayChange,
        }
      : { label: 'kundli.lagna', value: '—', detail: t('kundli.unknownShort') },
    {
      label: 'kundli.moonSign',
      value: names.signs[moon.sign],
      detail: formatDegrees(moon.degreeInSign),
      uncertain: uncertainty.moonSignMayChange,
    },
    {
      label: 'kundli.nakshatra',
      value: names.nakshatras[moon.nakshatra],
      detail: t('kundli.pada', { pada: moon.pada }),
      uncertain: uncertainty.moonNakshatraMayChange,
    },
    { label: 'kundli.sunSign', value: names.signs[sun.sign], detail: formatDegrees(sun.degreeInSign) },
  ]

  const monthYear = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' })
  const currentMaha = chart.dashas ? periodAt(chart.dashas, now) : undefined
  const currentAntar = currentMaha ? periodAt(currentMaha.antardashas, now) : undefined

  // —— Birth details summary ——
  const { place } = details
  const conversion = details.time ? localToUtc(details.date, details.time, place.timeZone) : null
  const dateText = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${details.date}T00:00:00Z`),
  )
  const utcText = conversion
    ? `${new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(conversion.utc)} (${formatOffset(conversion.offsetSeconds)})`
    : t('kundli.timeUnknown')
  const detailRows: [MessageKey, string][] = [
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
        <p className="muted">{t('kundli.subtitle')}</p>
      </header>

      {/* —— Key facts —— */}
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt>{t(fact.label)}</dt>
            <dd className={styles.factValue}>
              {fact.value}
              {fact.uncertain && <span className={styles.uncertainMark} aria-hidden="true">?</span>}
            </dd>
            <dd className={styles.factDetail}>{fact.detail}</dd>
          </div>
        ))}
      </dl>

      {/* —— Honest uncertainty notices —— */}
      <div className={styles.notices}>
        {uncertainty.basis === 'noon' && (
          <Notice tone="caution">
            <p>{t('kundli.chartMoonNote')}</p>
            <p>{t('kundli.noonNote')}</p>
          </Notice>
        )}
        {uncertainty.ascendantSignMayChange && <Notice tone="caution"><p>{t('kundli.warnAsc')}</p></Notice>}
        {uncertainty.moonSignMayChange && <Notice tone="caution"><p>{t('kundli.warnMoonSign')}</p></Notice>}
        {uncertainty.moonNakshatraMayChange && <Notice tone="caution"><p>{t('kundli.warnMoonNak')}</p></Notice>}
        {uncertainty.polarLatitude && chart.ascendant && <Notice tone="caution"><p>{t('kundli.warnPolar')}</p></Notice>}
        {conversion?.status === 'ambiguous' && <Notice tone="caution"><p>{t('kundli.ambiguous')}</p></Notice>}
      </div>

      {/* —— Baba's readings: the fun part, so it comes first —— */}
      <ReadingsSection chart={chart} names={names} now={now} />

      {/* —— Chart and positions —— */}
      <section className={styles.chartGrid} aria-labelledby="chart-title">
        <div className={styles.chartColumn}>
          <div className={styles.chartHead}>
            <h2 id="chart-title" className={styles.sectionTitle}>{chartTitle}</h2>
            <div className={styles.toggle} role="radiogroup" aria-label={t('kundli.styleLabel')}>
              {(['north', 'south'] as const).map((option) => (
                <label key={option} className={styles.toggleOption} data-checked={style === option}>
                  <input
                    type="radio"
                    name="chart-style"
                    value={option}
                    checked={style === option}
                    onChange={() => setStyle(option)}
                    className="visually-hidden"
                  />
                  {t(option === 'north' ? 'kundli.styleNorth' : 'kundli.styleSouth')}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.chartFrame}>
            {style === 'north' ? (
              <NorthIndianChart firstSign={firstSign} bySign={bySign} label={t('kundli.chartLabel')} />
            ) : (
              <SouthIndianChart firstSign={firstSign} bySign={bySign} label={t('kundli.chartLabel')} centreTitle={chartTitle.split(' — ')[0]} />
            )}
          </div>
        </div>

        <div className={styles.tableColumn}>
          <h2 className={styles.sectionTitle}>{t('kundli.tableTitle')}</h2>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{t('kundli.colGraha')}</th>
                  <th scope="col">{t('kundli.colSign')}</th>
                  <th scope="col">{t('kundli.colDegree')}</th>
                  <th scope="col">{t('kundli.colNakshatra')}</th>
                  {chart.ascendant && <th scope="col">{t('kundli.colHouse')}</th>}
                </tr>
              </thead>
              <tbody>
                {chart.ascendant && (
                  <tr className={styles.lagnaRow}>
                    <th scope="row">{t('kundli.lagna')}</th>
                    <td data-label={t('kundli.colSign')}>{names.signs[chart.ascendant.sign]}</td>
                    <td data-label={t('kundli.colDegree')} className={styles.num}>{formatDegrees(chart.ascendant.degreeInSign)}</td>
                    <td data-label={t('kundli.colNakshatra')}>{names.nakshatras[chart.ascendant.nakshatra]} {chart.ascendant.pada}</td>
                    <td data-label={t('kundli.colHouse')} className={styles.num}>1</td>
                  </tr>
                )}
                {chart.grahas.map((g) => (
                  <tr key={g.id}>
                    <th scope="row">
                      {grahaName(g.id)}
                      {g.retrograde && (
                        <span className={styles.retro} title={t('kundli.retrograde')}>
                          {' '}
                          ({t('kundli.retrograde')})
                        </span>
                      )}
                    </th>
                    <td data-label={t('kundli.colSign')}>{names.signs[g.sign]}</td>
                    <td data-label={t('kundli.colDegree')} className={styles.num}>{formatDegrees(g.degreeInSign)}</td>
                    <td data-label={t('kundli.colNakshatra')}>{names.nakshatras[g.nakshatra]} {g.pada}</td>
                    {chart.ascendant && <td data-label={t('kundli.colHouse')} className={styles.num}>{g.house}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* —— Vimshottari dasha —— */}
      <section className={styles.dasha} aria-labelledby="dasha-title">
        <h2 id="dasha-title" className={styles.sectionTitle}>{t('kundli.dashaTitle')}</h2>
        <p className="muted">{t('kundli.dashaLead')}</p>
        {!chart.dashas ? (
          <Notice>
            <p>{t('kundli.dashaUnknown')}</p>
          </Notice>
        ) : (
          <>
            {uncertainty.basis === 'approximate' && <p className={styles.small}>{t('kundli.dashaApprox')}</p>}
            <ol className={styles.dashaList}>
              {chart.dashas.map((maha) => {
                const current = maha === currentMaha
                return (
                  <li key={maha.start.getTime()} className={styles.dashaItem} data-current={current} aria-current={current ? 'true' : undefined}>
                    <span className={styles.dashaLord}>{grahaName(maha.lord)}</span>
                    <span className={styles.dashaDates}>
                      {monthYear.format(maha.start)} – {monthYear.format(maha.end)}
                    </span>
                    {current && <span className={styles.badge}>{t('kundli.dashaCurrent')}</span>}
                    {current && (
                      <div className={styles.antar}>
                        <p className={styles.small}>{t('kundli.dashaAntar', { lord: grahaName(maha.lord) })}</p>
                        <ol className={styles.antarList}>
                          {maha.antardashas.map((sub) => (
                            <li key={sub.start.getTime()} data-current={sub === currentAntar}>
                              <span>{grahaName(sub.lord)}</span>
                              <span className={styles.dashaDates}>{monthYear.format(sub.start)}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </section>

      {/* —— Details & next steps —— */}
      <details className={styles.details}>
        <summary>{t('kundli.detailsToggle')}</summary>
        <dl className={styles.detailList}>
          {detailRows.map(([label, value]) => (
            <div key={label}>
              <dt>{t(label)}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.small}>
          {t('kundli.ayanamsha', { value: formatDegrees(chart.ayanamsha) })} · <Link to="/method">{t('kundli.methodLink')}</Link>
        </p>
      </details>

      <div className={styles.footerBlock}>
        <div className={styles.actions}>
          <Link to="/begin" className="btn btn-ghost">{t('kundli.edit')}</Link>
          <button type="button" className="btn-text" onClick={() => { forget(); navigate('/begin') }}>
            {t('kundli.forget')}
          </button>
        </div>
        <p className={styles.small}>{t('disclaimer.full')}</p>
      </div>
    </div>
  )
}
