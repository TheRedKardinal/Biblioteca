import { Skeleton, Text, Tooltip } from '@radix-ui/themes'
import { motion, type Variants } from 'motion/react'
import { useEffect, useState } from 'react'
import { cercaLibri, urlCopertina, type LibroOL } from '@/lib/openLibrary'
import styles from './Vetrina.module.css'

const PER_RIPIANO = 4
const RIPIANI = 2
// Pagine dei titoli piu' letti tra cui pescare: a ogni visita la vetrina cambia
const PAGINE_POSSIBILI = 8
// Formati leggermente diversi, come libri veri su uno scaffale
const LARGHEZZE = ['100%', '90%', '96%', '86%']

const ripiano: Variants = {
  nascosto: {},
  visibile: (i: number) => ({
    transition: { staggerChildren: 0.08, delayChildren: 0.25 + i * 0.2 },
  }),
}

const libro: Variants = {
  nascosto: { opacity: 0, y: 24 },
  visibile: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function Vetrina() {
  const [libri, setLibri] = useState<LibroOL[] | null>(null)
  const [errore, setErrore] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    const pagina = 1 + Math.floor(Math.random() * PAGINE_POSSIBILI)
    cercaLibri({
      q: 'subject:fiction',
      ordinamento: 'readinglog',
      pagina,
      perPagina: PER_RIPIANO * RIPIANI + 4, // margine per i risultati scartati dal filtro
      signal: ctrl.signal,
    })
      .then((p) => setLibri(p.libri.slice(0, PER_RIPIANO * RIPIANI)))
      .catch((e) => {
        if (!ctrl.signal.aborted) {
          console.warn(e)
          setErrore(true)
        }
      })
    return () => ctrl.abort()
  }, [])

  // Senza Open Library resta solo lo sfondo della hero
  if (errore) return <div className={styles.vetrina} aria-hidden="true" />

  const ripiani = Array.from({ length: RIPIANI }, (_, r) =>
    libri ? libri.slice(r * PER_RIPIANO, (r + 1) * PER_RIPIANO) : null,
  )

  return (
    <div className={styles.vetrina}>
      <Text as="p" size="1" weight="medium" className={styles.etichetta}>
        In vetrina
      </Text>
      {ripiani.map((r, i) => (
        <div key={i} className={styles.ripiano}>
          {r ? (
            <motion.ul
              className={styles.libri}
              variants={ripiano}
              custom={i}
              initial="nascosto"
              animate="visibile"
            >
              {r.map((l, j) => (
                <motion.li
                  key={l.key}
                  variants={libro}
                  className={styles.slot}
                  style={{ width: LARGHEZZE[(j + i) % LARGHEZZE.length] }}
                >
                  <Copertina libro={l} />
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <div className={styles.libri}>
              {Array.from({ length: PER_RIPIANO }, (_, j) => (
                <Skeleton key={j} className={styles.slot} style={{ width: LARGHEZZE[j] }} />
              ))}
            </div>
          )}
          <div className={styles.mensola} aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}

function Copertina({ libro }: { libro: LibroOL }) {
  const [caricata, setCaricata] = useState(false)
  const autore = libro.autori[0]
  return (
    <Tooltip content={`${libro.titolo} - ${autore}`}>
      <a
        href={`https://openlibrary.org${libro.key}`}
        target="_blank"
        rel="noreferrer"
        className={styles.copertina}
      >
        <img
          src={urlCopertina(libro.copertinaId, 'M')}
          alt={`${libro.titolo}, di ${autore}`}
          decoding="async"
          onLoad={() => setCaricata(true)}
          data-caricata={caricata}
        />
      </a>
    </Tooltip>
  )
}
