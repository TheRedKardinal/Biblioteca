import { Route, Routes } from 'react-router'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/home/Home'
import { InArrivo } from './pages/InArrivo'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<InArrivo />} />
      </Route>
    </Routes>
  )
}
