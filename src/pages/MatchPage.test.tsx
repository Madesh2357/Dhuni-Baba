import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BirthDetailsProvider } from '../data/BirthDetailsProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import MatchPage from './MatchPage'

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
          <MatchPage />
        </BirthDetailsProvider>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('MatchPage', () => {
  it('asks for your own details first', () => {
    renderPage()
    expect(screen.getByText('Baba needs your own birth details first.')).toBeInTheDocument()
  })

  it('scores a match out of 36 with all eight kootas', async () => {
    sessionStorage.setItem('dhuni-baba:birth-details', JSON.stringify(ME))
    renderPage()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Partner’s name'), 'Partner')
    await user.type(screen.getByLabelText('Date of birth'), '1996-02-14')
    await user.click(screen.getByRole('button', { name: 'Enter coordinates manually instead' }))
    await user.type(screen.getByLabelText('Latitude'), '28.6139')
    await user.type(screen.getByLabelText('Longitude'), '77.2090')
    await user.type(screen.getByLabelText('Time zone'), 'Asia/Kolkata')
    await user.click(screen.getByRole('button', { name: 'Check compatibility' }))

    expect((await screen.findAllByText('/36', { selector: 'span' })).length).toBe(2) // headline + total row
    for (const koota of ['Varna', 'Vashya', 'Tara', 'Yoni', 'Graha Maitri', 'Gana', 'Bhakoot', 'Nadi']) {
      expect(screen.getByText(koota)).toBeInTheDocument()
    }
    expect(screen.getByText(/Partner: Moon in/)).toBeInTheDocument()
  })

  it('shows validation errors for an empty partner form', async () => {
    sessionStorage.setItem('dhuni-baba:birth-details', JSON.stringify(ME))
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Check compatibility' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Please check the highlighted fields')
  })
})
