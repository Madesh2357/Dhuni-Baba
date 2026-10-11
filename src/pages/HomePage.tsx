import { Link } from 'react-router-dom'
import { BabaIllustration } from '../components/BabaIllustration'
import { ChartIllustration } from '../components/ChartIllustration'
import { Divider } from '../components/Divider'
import { usePageTitle } from '../components/usePageTitle'
import { LANGUAGES } from '../i18n/languages'
import type { MessageKey } from '../i18n/locales/en'
import { useI18n } from '../i18n/useI18n'
import styles from './HomePage.module.css'

const STEPS: [MessageKey, MessageKey][] = [
  ['home.step1Title', 'home.step1Body'],
  ['home.step2Title', 'home.step2Body'],
  ['home.step3Title', 'home.step3Body'],
]

const HEART: [MessageKey, MessageKey][] = [
  ['home.heartVenusTitle', 'home.heartVenusBody'],
  ['home.heartGunaTitle', 'home.heartGunaBody'],
  ['home.heartMangalTitle', 'home.heartMangalBody'],
  ['home.heartMarriageTitle', 'home.heartMarriageBody'],
]

const NUMERALS = ['I', 'II', 'III']

export function HomePage() {
  const { t } = useI18n()
  usePageTitle()

  return (
    <>
      {/* ——— Hero ——— */}
      <section className={`container ${styles.hero}`}>
        <div className={`${styles.heroText} rise`}>
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className={styles.heroTitle}>{t('home.title')}</h1>
          <p className="lead">{t('home.lead')}</p>
          <div className={styles.actions}>
            <Link to="/begin" className="btn">
              {t('home.cta')}
            </Link>
            <a href="#how" className="btn btn-ghost">
              {t('home.ctaSecondary')}
            </a>
          </div>
          <p className={styles.disclaimer}>{t('disclaimer.short')}</p>
        </div>
        <div className={`${styles.heroArt} rise rise-delay`}>
          <BabaIllustration label={t('home.illustrationLabel')} />
        </div>
      </section>

      {/* ——— How it works: an editorial numbered list, not a card grid ——— */}
      <section id="how" className={`container ${styles.section}`}>
        <Divider />
        <div className={styles.split}>
          <h2 className={styles.splitTitle}>{t('home.stepsTitle')}</h2>
          <ol className={styles.steps}>
            {STEPS.map(([title, body], i) => (
              <li key={title} className={styles.step}>
                <span className={styles.numeral} aria-hidden="true">
                  {NUMERALS[i]}
                </span>
                <div>
                  <h3>{t(title)}</h3>
                  <p className="muted">{t(body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Matters of the heart ——— */}
      <section className={styles.heartBand}>
        <div className={`container ${styles.heart}`}>
          <div className={styles.heartIntro}>
            <p className="eyebrow">{t('home.heartEyebrow')}</p>
            <h2>{t('home.heartTitle')}</h2>
            <p className="lead">{t('home.heartLead')}</p>
            <ChartIllustration className={styles.heartChart} />
          </div>
          <dl className={styles.heartList}>
            {HEART.map(([title, body]) => (
              <div key={title} className={styles.heartItem}>
                <dt>{t(title)}</dt>
                <dd>{t(body)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ——— Pull quote ——— */}
      <section className={`container ${styles.quoteWrap}`}>
        <figure className={styles.quote}>
          <blockquote>
            <p>“{t('home.quote')}”</p>
          </blockquote>
          <figcaption>— {t('home.quoteSource')}</figcaption>
        </figure>
      </section>

      {/* ——— Languages, each in its own script ——— */}
      <section className={`container ${styles.section}`}>
        <Divider />
        <div className={styles.split}>
          <div>
            <h2 className={styles.splitTitle}>{t('home.languagesTitle')}</h2>
            <p className="muted">{t('home.languagesBody')}</p>
          </div>
          <ul className={styles.languages}>
            {LANGUAGES.map((lang) => (
              <li key={lang.code} lang={lang.code}>
                {lang.nativeName}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— The disclaimer, given real prominence ——— */}
      <section className={`container ${styles.section}`}>
        <div className={styles.vow}>
          <h2>{t('home.vowTitle')}</h2>
          <p>{t('home.vowBody')}</p>
          <p className={styles.vowStrong}>{t('disclaimer.short')}</p>
        </div>
      </section>

      {/* ——— Closing call to action ——— */}
      <section className={`container ${styles.final}`}>
        <h2>{t('home.finalTitle')}</h2>
        <Link to="/begin" className="btn">
          {t('home.cta')}
        </Link>
      </section>
    </>
  )
}
