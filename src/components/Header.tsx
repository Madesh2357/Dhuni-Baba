import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import type { MessageKey } from '../i18n/locales/en'
import { LanguageSwitcher } from './LanguageSwitcher'
import { BrandMark } from './BrandMark'
import styles from './Header.module.css'

const LINKS: { to: string; label: MessageKey }[] = [
  { to: '/begin', label: 'nav.begin' },
  { to: '/kundli', label: 'nav.kundli' },
  { to: '/method', label: 'nav.method' },
  { to: '/privacy', label: 'nav.privacy' },
]

export function Header() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  // The menu remembers which page it was opened on, so it closes by itself
  // as soon as you navigate somewhere else.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null)
  const open = openOnPath === pathname
  const setOpen = (value: boolean) => setOpenOnPath(value ? pathname : null)

  // Close it with the Escape key too.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenOnPath(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand}>
          <BrandMark className={styles.mark} />
          <span>
            <span className={styles.name}>Dhuni Baba</span>
            <span className={styles.tagline}>{t('brand.tagline')}</span>
          </span>
        </Link>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? t('nav.close') : t('nav.menu')}
        </button>

        <div id="site-nav" className={styles.panel} data-open={open}>
          <nav aria-label="Main">
            <ul className={styles.links}>
              {LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
                  >
                    {t(link.label)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
