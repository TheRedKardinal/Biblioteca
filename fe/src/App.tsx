import { useEffect, useState } from 'react'
import { api, type Stato } from '@/lib/api'
import styles from './App.module.css'

export default function App() {
  const [stato, setStato] = useState<Stato | null>(null)
  const [errore, setErrore] = useState<string | null>(null)

  useEffect(() => {
    api
      .stato()
      .then(setStato)
      .catch((e) => setErrore(e instanceof Error ? e.message : String(e)))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Progetto base</h1>
        <p className={styles.subtitle}>React + TypeScript, Spring Boot, PostgreSQL.</p>

        <section className={styles.card}>
          <div className={styles.row}>
            <span className={styles.label}>API</span>
            <code className={styles.value}>{api.indirizzo}</code>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Database</span>
            <span className={styles.value}>{stato ? stato.database : '...'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Ora del server</span>
            <span className={styles.value}>{stato ? stato.ora : '...'}</span>
          </div>
        </section>

        {errore && <p className={styles.error}>{errore}</p>}
      </div>
    </div>
  )
}
