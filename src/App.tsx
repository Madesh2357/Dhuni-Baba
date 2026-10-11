import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BirthDetailsPage } from './pages/BirthDetailsPage'
import { HomePage } from './pages/HomePage'
import { KundliPage } from './pages/KundliPage'
import { MethodPage } from './pages/MethodPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'

/** Every page of the site. Add a <Route> here to add a page. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="begin" element={<BirthDetailsPage />} />
        <Route path="kundli" element={<KundliPage />} />
        <Route path="method" element={<MethodPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
