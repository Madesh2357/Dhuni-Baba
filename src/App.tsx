import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BirthDetailsPage } from './pages/BirthDetailsPage'
import { HomePage } from './pages/HomePage'
import { KundliPage } from './pages/KundliPage'
import { LovePage } from './pages/LovePage'
import { MethodPage } from './pages/MethodPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SharedPage } from './pages/SharedPage'

// Loaded on demand: it carries the astronomy engine.
const MatchPage = lazy(() => import('./pages/MatchPage'))

/** Every page of the site. Add a <Route> here to add a page. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="begin" element={<BirthDetailsPage />} />
        <Route path="kundli" element={<KundliPage />} />
        <Route path="love" element={<LovePage />} />
        <Route
          path="match"
          element={
            <Suspense fallback={<div className="container" style={{ minHeight: '60vh' }} />}>
              <MatchPage />
            </Suspense>
          }
        />
        <Route path="share" element={<SharedPage />} />
        <Route path="method" element={<MethodPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
