import { Heading, Text } from '@radix-ui/themes'
import { motion } from 'motion/react'
import styles from './Presentazione.module.css'

const punti = [
  { valore: 'Pubblico', etichetta: 'catalogo consultabile senza account' },
  { valore: '3 durate', etichetta: 'di prestito: breve, media e lunga' },
  { valore: '1 proroga', etichetta: 'disponibile per ogni prestito' },
]

export function Presentazione() {
  return (
    <section className={styles.sezione} aria-labelledby="presentazione-titolo">
      <motion.div
        className={styles.griglia}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <Text as="p" size="2" weight="medium" className={styles.occhiello}>
            La biblioteca
          </Text>
          <Heading as="h2" id="presentazione-titolo" size="8" className={styles.titolo}>
            Una biblioteca di quartiere, con un catalogo sempre aperto.
          </Heading>
        </div>

        <div className={styles.testo}>
          <Text as="p" size="4" color="gray">
            Prendiamo in prestito i libri come si è sempre fatto, al banco e con un bibliotecario
            che ti consiglia. Quello che cambia è tutto il resto: il catalogo è online, vedi subito
            se un titolo è disponibile e ritrovi i tuoi prestiti con le date di riconsegna in un
            unico posto.
          </Text>
          <Text as="p" size="4" color="gray">
            Registrati una volta sola: al primo prestito il tuo profilo è già pronto e non devi
            compilare nessun modulo.
          </Text>
        </div>
      </motion.div>

      <ul className={styles.punti}>
        {punti.map((p, i) => (
          <motion.li
            key={p.valore}
            className={styles.punto}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
          >
            <Text as="p" size="7" weight="medium" className={styles.valore}>
              {p.valore}
            </Text>
            <Text as="p" size="2" color="gray">
              {p.etichetta}
            </Text>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
