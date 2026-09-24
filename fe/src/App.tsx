import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/home/Home'
import { InArrivo } from './pages/InArrivo'

// Il catalogo si scarica solo quando serve: la home resta leggera
const Catalogo = lazy(() => import('./pages/catalogo/Catalogo').then((m) => ({ default: m.Catalogo })))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="catalogo"
          element={
            <Suspense fallback={null}>
              <Catalogo />
            </Suspense>
          }
        />
        <Route path="*" element={<InArrivo />} />
      </Route>
    </Routes>
  )
}
