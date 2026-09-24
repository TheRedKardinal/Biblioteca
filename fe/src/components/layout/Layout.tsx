import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Footer } from './Footer'
import { Header } from './Header'
import styles from './Layout.module.css'

export function Layout() {
  const { pathname, hash } = useLocation()

  // Link con ancora (/#come-funziona) e cambi di pagina
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [pathname, hash])

  return (
    <div className={styles.layout}>
      <a href="#contenuto" className={styles.salta}>
        Vai al contenuto
      </a>
      <Header />
      <main id="contenuto" className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
