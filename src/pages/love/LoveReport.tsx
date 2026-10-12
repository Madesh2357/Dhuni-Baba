import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeChart, GRAHA_ORDER, type GrahaId } from '../../astrology'
import { Notice } from '../../components/Notice'
import type { BirthDetails } from '../../data/types'
import { BASE_SCORE, computeLoveReport, type LoveFactor } from '../../interpretation'
import type { MessageKey } from '../../i18n/locales/en'
import { useAstroNames } from '../../i18n/useAstroNames'
import { useI18n } from '../../i18n/useI18n'
import styles from './LoveReport.module.css'

const key = (k: string) => k as MessageKey

/** The Romance Index as a half-circle gauge. Decorative: the number is also in the text. */
function Gauge({ score }: { score: number }) {
  const r = 80
  const length = Math.PI * r
  return (
    <svg className={styles.gauge} viewBox="0 0 200 112" aria-hidden="true">
      <path d="M20 100 A80 80 0 0 1 180 100" className={styles.gaugeTrack} pathLength={length} />
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        className={styles.gaugeFill}
        pathLength={length}
        strokeDasharray={`${(score / 100) * length} ${length}`}
      />
    </svg>
  )
}

/** The Love & Marriage report for one person. Loaded on demand by LovePage. */
export default function LoveReport({ details }: { details: BirthDetails }) {
  const { t, locale } = useI18n()
  const names = useAstroNames()
  const [now] = useState(() => new Date())
  const chart = useMemo(() => computeChart(details), [details])
  const report = useMemo(() => computeLoveReport(chart, now), [chart, now])

  const sign = (i: number) => names.signs[i]
  const graha = (id: GrahaId) => names.grahas[GRAHA_ORDER.indexOf(id)]
  const element = (e: string) => t(key(`love.el.${e}`))
  const monthYear = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' })
  const { index } = report

  const factorText = (f: LoveFactor) =>
    t(key(`love.f.${f.id}`), {
      sign: f.sign === undefined ? '' : sign(f.sign),
      house: f.house ?? '',
      planets: (f.planets ?? []).map(graha).join(', '),
    })
  const points = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0')

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className="eyebrow">{t('love.eyebrow')}</p>
        <h1>{t('love.title', { name: details.name })}</h1>
        <p className="lead">{t('love.lead')}</p>
      </header>

      <Notice tone="caution">
        <p>{t('love.disclaimer')}</p>
      </Notice>

      {/* —— Romance Index —— */}
      <section className={styles.index} aria-labelledby="love-index">
        <div className={styles.meter}>
          <Gauge score={index.score} />
          <p className={styles.score}>
            <span className={styles.scoreValue}>{index.score}</span>
            <span className={styles.scoreMax}>/100</span>
          </p>
        </div>
        <div>
          <h2 id="love-index" className={styles.sectionTitle}>{t('love.indexTitle')}</h2>
          <p className={styles.band}>{t(key(`love.band.${index.band}`))}</p>
          <p className="muted">{t('love.indexNote')}</p>
          <ul className={styles.factors}>
            <li>
              <span>{t('love.indexBase')}</span>
              <span className={styles.points}>{BASE_SCORE}</span>
            </li>
            {index.factors.map((f) => (
              <li key={f.id}>
                <span>{factorText(f)}</span>
                <span className={styles.points} data-sign={Math.sign(f.points)}>{points(f.points)}</span>
              </li>
            ))}
          </ul>
          {!index.usedHouses && <p className={styles.note}>{t('love.noTimeNote')}</p>}
        </div>
      </section>

      {/* —— Love life —— */}
      <div className={styles.cards}>
        <article className={styles.card}>
          <h3>{t('love.languageTitle')}</h3>
          <p className={styles.basis}>
            {t('love.languageBasis', { sign: sign(report.venusSign), element: element(report.loveLanguage) })}
          </p>
          <p className={styles.text}>{t(key(`love.lang.${report.loveLanguage}`))}</p>
        </article>
        <article className={styles.card}>
          <h3>{t('love.redTitle')}</h3>
          <p className={styles.basis}>{t('love.redBasis', { sign: sign(report.marsSign) })}</p>
          <p className={styles.text}>{t(key(`love.red.${report.marsSign}`))}</p>
        </article>
        <article className={styles.card}>
          <h3>{t('love.fightTitle')}</h3>
          <p className={styles.basis}>
            {t('love.fightBasis', { mars: sign(report.marsSign), venus: sign(report.venusSign) })}
          </p>
          <p className={styles.text}>{t(key(`love.fight.${report.fights}`))}</p>
        </article>
      </div>

      {/* —— Marriage —— */}
      <section aria-labelledby="love-marriage" className={styles.marriage}>
        <h2 id="love-marriage" className={styles.sectionTitle}>{t('love.marriageTitle')}</h2>
        <div className={styles.cards}>
          <article className={styles.card}>
            <h3>{t('love.typeTitle')}</h3>
            {report.marriageType ? (
              <>
                <p className={styles.basis}>
                  {t('love.typeBasis', {
                    lord5: graha(report.marriageType.lord5),
                    lord7: graha(report.marriageType.lord7),
                  })}
                </p>
                <p className={styles.text}>{t(key(`love.type.${report.marriageType.kind}`))}</p>
              </>
            ) : (
              <p className={styles.text}>{t('love.typeNoTime')}</p>
            )}
          </article>
          <article className={styles.card}>
            <h3>{t('love.weddingTitle')}</h3>
            <p className={styles.basis}>
              {t('love.weddingBasis', { lord: graha(report.wedding.lord), element: element(report.wedding.element) })}
            </p>
            <p className={styles.text}>{t(key(`love.wedding.${report.wedding.element}`))}</p>
          </article>
          <article className={styles.card}>
            <h3>{t('love.inlawTitle')}</h3>
            {report.inLaws ? (
              <>
                <p className={styles.basis}>{t('love.inlawBasis', { sign: sign(report.inLaws.sign) })}</p>
                <p className={styles.text}>{t(key(`love.inlaw.${report.inLaws.element}`))}</p>
              </>
            ) : (
              <p className={styles.text}>{t('love.inlawNoTime')}</p>
            )}
          </article>
        </div>

        <div className={styles.alert} role="note">
          <h3>{t('love.alertTitle')}</h3>
          <p>
            {report.shaadiAlert === null
              ? t('love.alertNoTime')
              : report.shaadiAlert === undefined
                ? t('love.alertNone')
                : t('love.alertBody', {
                    maha: graha(report.shaadiAlert.maha),
                    antar: graha(report.shaadiAlert.antar),
                    start: monthYear.format(report.shaadiAlert.start),
                    end: monthYear.format(report.shaadiAlert.end),
                  })}
          </p>
        </div>
      </section>

      <div className={styles.actions}>
        <Link to="/match" className="btn">{t('love.matchCta')}</Link>
        <Link to="/kundli" className="btn-text">{t('nav.kundli')}</Link>
      </div>
    </div>
  )
}
