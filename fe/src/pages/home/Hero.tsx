import { ArrowRightIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Badge, Button, Heading, Text, TextField } from '@radix-ui/themes'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Vetrina } from './Vetrina'
import styles from './Hero.module.css'

const contenitore: Variants = {
  nascosto: {},
  visibile: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const elemento: Variants = {
  nascosto: { opacity: 0, y: 16 },
  visibile: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function Hero() {
  const navigate = useNavigate()
  const [ricerca, setRicerca] = useState('')
  const riduci = useReducedMotion()

  function cerca(e: FormEvent) {
    e.preventDefault()
    const q = ricerca.trim()
    navigate(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')
  }

  return (
    <section className={styles.hero} aria-labelledby="hero-titolo">
      {/* Sfondo: due macchie dello stesso colore che si spostano lentamente */}
      <div className={styles.sfondo} aria-hidden="true">
        <motion.div
          className={`${styles.macchia} ${styles.macchiaA}`}
          animate={riduci ? undefined : { x: [0, 60, -20, 0], y: [0, 30, -10, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={`${styles.macchia} ${styles.macchiaB}`}
          animate={riduci ? undefined : { x: [0, -50, 30, 0], y: [0, -40, 20, 0], scale: [1, 0.92, 1.08, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className={styles.grana} />
      </div>

      <div className={styles.griglia}>
        <motion.div
          className={styles.testo}
          variants={contenitore}
          initial="nascosto"
          animate="visibile"
        >
          <motion.div variants={elemento}>
            <Badge size="2" variant="soft" radius="full">
              Catalogo aperto a tutti
            </Badge>
          </motion.div>

          <motion.div variants={elemento}>
            <Heading as="h1" id="hero-titolo" size={{ initial: '8', md: '9' }} className={styles.titolo}>
              Ogni storia ha il suo posto. <span className={styles.evidenza}>Trova il tuo.</span>
            </Heading>
          </motion.div>

          <motion.div variants={elemento}>
            <Text as="p" size={{ initial: '3', md: '4' }} color="gray" className={styles.sottotitolo}>
              Cerca tra i titoli della biblioteca, controlla le copie disponibili e tieni d'occhio
              i tuoi prestiti, da qualsiasi dispositivo.
            </Text>
          </motion.div>

          <motion.form variants={elemento} onSubmit={cerca} className={styles.ricerca} role="search">
            <TextField.Root
              size="3"
              placeholder="Titolo, autore, ISBN..."
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              aria-label="Cerca nel catalogo"
              className={styles.campo}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
            <Button size="3" type="submit">
              Cerca
            </Button>
          </motion.form>

          <motion.div variants={elemento} className={styles.azioni}>
            <Button asChild size="3" variant="ghost" highContrast>
              <Link to="/catalogo">
                Sfoglia il catalogo <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="3" variant="ghost" color="gray">
              <Link to="/#come-funziona">Come funziona</Link>
            </Button>
          </motion.div>
        </motion.div>

        <Vetrina />
      </div>
    </section>
  )
}
