import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { BirthDetailsProvider } from './data/BirthDetailsProvider'
import { I18nProvider } from './i18n/I18nProvider'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/forms.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <BirthDetailsProvider>
          <App />
        </BirthDetailsProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
