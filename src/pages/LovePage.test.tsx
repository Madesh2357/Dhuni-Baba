import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BirthDetailsProvider } from '../data/BirthDetailsProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import { LovePage } from './LovePage'

const ME = {
  name: 'Zero',
  date: '1995-08-20',
  time: '06:45',
  timeAccuracy: 'exact',
  place: { label: 'Chennai', latitude: 13.0827, longitude: 80.2707, timeZone: 'Asia/Kolkata', source: 'manual' },
}

function renderPage() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <BirthDetailsProvider>
          <LovePage />
        </BirthDetailsProvider>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('LovePage', () => {
  it('asks for birth details first', () => {
    renderPage()
    expect(screen.getByText(/Baba needs your birth details/)).toBeInTheDocument()
  })

  it('shows the Romance Index, love life and marriage sections', async () => {
    sessionStorage.setItem('dhuni-baba:birth-details', JSON.stringify(ME))
    renderPage()
    expect(await screen.findByRole('heading', { level: 1, name: /Zero/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Baba’s Romance Index' })).toBeInTheDocument()
    expect(screen.getByText('/100')).toBeInTheDocument()
    expect(screen.getByText(/Everyone starts at 50/)).toBeInTheDocument()
    for (const title of ['love language', 'red flag', 'Fight forecast', 'Love marriage or arranged', 'wedding', 'In-law', 'Shaadi alert']) {
      expect(screen.getAllByRole('heading', { name: new RegExp(title, 'i') }).length).toBeGreaterThan(0)
    }
    expect(screen.queryByText(/house-based factors are skipped/i)).not.toBeInTheDocument()
  })

  it('is honest when the birth time is unknown', async () => {
    sessionStorage.setItem('dhuni-baba:birth-details', JSON.stringify({ ...ME, time: null, timeAccuracy: 'unknown' }))
    renderPage()
    expect(await screen.findByText(/house-based factors are skipped/i)).toBeInTheDocument()
  })
})
