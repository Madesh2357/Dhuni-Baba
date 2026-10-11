import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BirthDetailsProvider } from '../data/BirthDetailsProvider'
import { I18nProvider } from '../i18n/I18nProvider'
import { BirthDetailsPage } from './BirthDetailsPage'
import { KundliPage } from './KundliPage'

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/begin']}>
      <I18nProvider>
        <BirthDetailsProvider>
          <Routes>
            <Route path="/begin" element={<BirthDetailsPage />} />
            <Route path="/kundli" element={<KundliPage />} />
          </Routes>
        </BirthDetailsProvider>
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('BirthDetailsPage', () => {
  it('shows a summary of problems when submitted empty', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Reveal my chart' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Please check the highlighted fields (4)')
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('hides the time input and explains when the time is unknown', async () => {
    renderForm()
    await userEvent.click(screen.getByLabelText("I don't know my birth time"))
    expect(screen.queryByLabelText('Time of birth')).not.toBeInTheDocument()
    expect(screen.getByText(/ascendant \(Lagna\) and houses cannot be determined/)).toBeInTheDocument()
  })

  it('accepts manual coordinates and shows a calculated Kundli', async () => {
    renderForm()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Your name'), 'Zero')
    await user.type(screen.getByLabelText('Date of birth'), '1995-08-20')
    await user.type(screen.getByLabelText('Time of birth'), '06:45')
    await user.click(screen.getByRole('button', { name: 'Enter coordinates manually instead' }))
    await user.type(screen.getByLabelText('Latitude'), '13.0827')
    await user.type(screen.getByLabelText('Longitude'), '80.2707')
    await user.type(screen.getByLabelText('Time zone'), 'Asia/Kolkata')
    await user.click(screen.getByRole('button', { name: 'Reveal my chart' }))

    // The dashboard is lazy-loaded, so wait for it.
    expect(await screen.findByRole('heading', { name: 'Namaste, Zero.' }, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Birth chart/ })).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveTextContent('Sun (Surya)')
    expect(screen.getByText(/\+05:30/)).toBeInTheDocument() // 06:45 IST → 01:15 UTC
    expect(screen.queryByText(/Demonstration/)).not.toBeInTheDocument()
  })
})
