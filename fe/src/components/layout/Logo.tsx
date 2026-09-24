import { Link } from 'react-router'
import styles from './Logo.module.css'

export function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="Biblioteca, vai alla home">
      <svg className={styles.marchio} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4" y="6" width="6" height="20" rx="1.5" />
        <rect x="12" y="4" width="6" height="22" rx="1.5" />
        <rect x="20.5" y="7" width="6" height="19" rx="1.5" transform="rotate(12 23.5 16.5)" />
      </svg>
      <span className={styles.nome}>Biblioteca</span>
    </Link>
  )
}
