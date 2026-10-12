import { Link } from 'react-router-dom'
import { GRAHA_ORDER, type Chart, type GrahaId } from '../../astrology'
import { computeReadings } from '../../interpretation'
import type { AstroNames } from '../../i18n/astroNames'
import type { MessageKey } from '../../i18n/locales/en'
import { useI18n } from '../../i18n/useI18n'
import styles from './ReadingsSection.module.css'

interface Props {
  chart: Chart
  names: AstroNames
  now: Date
}

/**
 * Baba's chart-grounded readings. Every block shows the chart factor it is
 * based on (the "basis" line) so nothing reads as an unexplained prediction.
 */
export function ReadingsSection({ chart, names, now }: Props) {
  const { t, locale } = useI18n()
  const r = computeReadings(chart, chart.instant, now)
  const sign = (i: number) => names.signs[i]
  const graha = (id: GrahaId) => names.grahas[GRAHA_ORDER.indexOf(id)]
  const monthYear = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' })
  const key = (k: string) => k as MessageKey

  const { mangal, marriage } = r

  return (
    <section className={styles.section} aria-labelledby="readings-title">
      <header className={styles.head}>
        <h2 id="readings-title">{t('read.title')}</h2>
        <p className="muted">{t('read.lead')}</p>
      </header>

      <div className={styles.grid}>
        <article className={styles.reading}>
          <h3>{t('read.personalityTitle')}</h3>
          <p className={styles.basis}>
            {r.personality.source === 'lagna'
              ? t('read.basisLagna', { sign: sign(r.personality.sign) })
              : t('read.basisMoon', { sign: sign(r.personality.sign) })}
          </p>
          <p className={styles.text}>{t(key(`read.lagna.${r.personality.sign}`))}</p>
          {r.personality.uncertain && <p className={styles.flag}>{t('read.mayChange')}</p>}
        </article>

        <article className={styles.reading}>
          <h3>{t('read.loveTitle')}</h3>
          <p className={styles.basis}>
            {r.love.venusHouse
              ? t('read.loveBasis', { sign: sign(r.love.venusSign), house: r.love.venusHouse })
              : t('read.loveBasisNoHouse', { sign: sign(r.love.venusSign) })}
          </p>
          <p className={styles.text}>{t(key(`read.venus.${r.love.venusSign}`))}</p>
        </article>

        <article className={styles.reading}>
          <h3>{t('read.partnerTitle')}</h3>
          <p className={styles.basis}>
            {r.partner.source === 'lagna'
              ? t('read.partnerBasis', { sign: sign(r.partner.sign), lord: graha(r.partner.lord) })
              : t('read.partnerBasisMoon', { sign: sign(r.partner.sign) })}
          </p>
          <p className={styles.text}>{t(key(`read.seventh.${r.partner.sign}`))}</p>
          {r.partner.uncertain && <p className={styles.flag}>{t('read.mayChange')}</p>}
        </article>

        <article className={styles.reading}>
          <h3>{t('read.mangalTitle')}</h3>
          {mangal.fromLagna ? (
            <>
              <p className={styles.text}>
                {mangal.fromLagna.present
                  ? t('read.mangal.present', { house: mangal.fromLagna.house })
                  : t('read.mangal.none')}
              </p>
              {mangal.fromLagna.present && mangal.cancelledBySign && (
                <p className={styles.small}>{t('read.mangal.cancel', { sign: sign(mangal.marsSign) })}</p>
              )}
              <p className={styles.small}>
                {mangal.fromMoon.present ? t('read.mangal.fromMoonYes') : t('read.mangal.fromMoonNo')}
              </p>
            </>
          ) : (
            <p className={styles.text}>
              {mangal.fromMoon.present
                ? t('read.mangal.moonOnlyYes', { house: mangal.fromMoon.house })
                : t('read.mangal.moonOnlyNo', { house: mangal.fromMoon.house })}
            </p>
          )}
        </article>

        <article className={`${styles.reading} ${styles.wide}`}>
          <h3>{t('read.marriageTitle')}</h3>
          {!marriage ? (
            <p className={styles.text}>{t('read.marriage.noTime')}</p>
          ) : (
            <>
              <p className={styles.text}>{t('read.marriage.intro', { lord: graha(marriage.seventhLord) })}</p>
              {marriage.windows.length === 0 ? (
                <p className={styles.small}>{t('read.marriage.none')}</p>
              ) : (
                <ol className={styles.windows}>
                  {marriage.windows.map((w) => (
                    <li key={w.start.getTime()}>
                      <span className={styles.windowLords}>
                        {graha(w.maha)} / {graha(w.antar)}
                      </span>
                      <span className={styles.windowDates}>
                        {monthYear.format(w.start)} – {monthYear.format(w.end)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </article>
      </div>

      <aside className={`${styles.cta} no-print`}>
        <div>
          <h3>{t('read.matchCta')}</h3>
          <p className="muted">{t('read.matchCtaBody')}</p>
        </div>
        <div className={styles.ctaButtons}>
          <Link to="/love" className="btn">
            {t('love.cta')}
          </Link>
          <Link to="/match" className="btn btn-ghost">
            {t('nav.match')}
          </Link>
        </div>
      </aside>

      <p className={styles.disclaimer}>{t('read.disclaimer')}</p>
    </section>
  )
}
