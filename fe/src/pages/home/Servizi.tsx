import {
  CalendarIcon,
  CheckCircledIcon,
  CounterClockwiseClockIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  ReaderIcon,
} from '@radix-ui/react-icons'
import { Card, Heading, Text } from '@radix-ui/themes'
import { motion, type Variants } from 'motion/react'
import styles from './Servizi.module.css'

// Ogni voce corrisponde a una funzione reale del backend (vedi commenti)
const servizi = [
  {
    icona: MagnifyingGlassIcon,
    titolo: 'Cerca nel catalogo',
    testo: 'Titolo, autore, casa editrice, ISBN o anno: combina i filtri e arrivi subito al libro giusto.',
  }, // POST /api/book/search
  {
    icona: CheckCircledIcon,
    titolo: 'Controlla la disponibilità',
    testo: 'Per ogni titolo vedi quante copie sono libere prima ancora di uscire di casa.',
  }, // copieDisponibili / copieTotali
  {
    icona: LayersIcon,
    titolo: 'Sfoglia per genere',
    testo: 'Romanzi, saggi, gialli e molto altro: lasciati ispirare scaffale per scaffale.',
  }, // /api/generi
  {
    icona: CalendarIcon,
    titolo: 'Scegli la durata',
    testo: 'Prestito breve, medio o lungo: al banco scegli il tempo che fa per te.',
  }, // DurataPrestito
  {
    icona: CounterClockwiseClockIcon,
    titolo: 'Proroga il prestito',
    testo: 'Ti serve qualche giorno in più? Ogni prestito si può prorogare una volta.',
  }, // /api/prestiti/ExtendPrestito
  {
    icona: ReaderIcon,
    titolo: 'Segui i tuoi prestiti',
    testo: "Nella tua area trovi prestiti in corso, in ritardo e conclusi, con le date di riconsegna.",
  }, // /api/prestiti/UserPrestiti
]

const griglia: Variants = {
  nascosto: {},
  visibile: { transition: { staggerChildren: 0.07 } },
}

const scheda: Variants = {
  nascosto: { opacity: 0, y: 20 },
  visibile: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export function Servizi() {
  return (
    <section id="come-funziona" className={styles.sezione} aria-labelledby="servizi-titolo">
      <div className={styles.intestazione}>
        <Heading as="h2" id="servizi-titolo" size="8" className={styles.titolo}>
          Cosa puoi fare
        </Heading>
        <Text as="p" size="3" color="gray">
          Tutto quello che serve per leggere di più, con meno pensieri.
        </Text>
      </div>

      <motion.ul
        className={styles.griglia}
        variants={griglia}
        initial="nascosto"
        whileInView="visibile"
        viewport={{ once: true, margin: '-80px' }}
      >
        {servizi.map(({ icona: Icona, titolo, testo }) => (
          <motion.li key={titolo} variants={scheda} className={styles.voce}>
            <Card size="3" className={styles.card}>
              <span className={styles.icona}>
                <Icona width="20" height="20" aria-hidden="true" />
              </span>
              <Heading as="h3" size="4" mt="4" mb="2">
                {titolo}
              </Heading>
              <Text as="p" size="2" color="gray">
                {testo}
              </Text>
            </Card>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}
