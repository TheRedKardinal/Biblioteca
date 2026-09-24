import { ArrowUpIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Button, Callout, Flex, Heading, IconButton, Text } from '@radix-ui/themes'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  costruisciQuery,
  PERIODI,
  type Filtri,
  type LibroOL,
  type Ordinamento,
  type Periodo,
} from '@/lib/openLibrary'
import styles from './Catalogo.module.css'
import { DettaglioLibro } from './DettaglioLibro'
import { BarraFiltri, ORDINAMENTI, type Ordine } from './BarraFiltri'
import { GrigliaLibri } from './GrigliaLibri'
import { useCatalogo } from './useCatalogo'

const numero = new Intl.NumberFormat('it-IT')

// Con un testo conta la pertinenza, senza testo si mostrano i piu' letti
const ordineDefault = (testo: string): Ordine => (testo.trim() ? 'pertinenza' : 'readinglog')

// I filtri vivono nell'URL (/catalogo?q=tolkien&genere=fantasy): la ricerca della
// home arriva qui gia' compilata e ogni risultato si puo' condividere col link.
function leggiFiltri(p: URLSearchParams): Filtri & { ordine: Ordine } {
  const periodo = p.get('periodo') as Periodo | null
  const ordine = p.get('ordine') as Ordine | null
  return {
    testo: p.get('q') ?? '',
    genere: p.get('genere') ?? '',
    periodo: PERIODI.some((x) => x.valore === periodo) ? periodo! : 'tutti',
    soloCopertina: p.get('copertina') !== 'tutte',
    ordine: ORDINAMENTI.some((x) => x.valore === ordine) ? ordine! : ordineDefault(p.get('q') ?? ''),
  }
}

export function Catalogo() {
  const [params, setParams] = useSearchParams()
  const filtri = leggiFiltri(params)
  const [aperto, setAperto] = useState<LibroOL | null>(null)

  // Stringa semplice: useCatalogo riparte solo quando la query cambia davvero
  const q = costruisciQuery(filtri)
  const ordinamento: Ordinamento | undefined =
    filtri.ordine === 'pertinenza' ? undefined : filtri.ordine
  const catalogo = useCatalogo(q, ordinamento)

  function aggiorna(modifiche: Partial<Filtri & { ordine: Ordine }>) {
    const f = { ...filtri, ...modifiche }
    const p = new URLSearchParams()
    if (f.testo.trim()) p.set('q', f.testo.trim())
    if (f.genere) p.set('genere', f.genere)
    if (f.periodo !== 'tutti') p.set('periodo', f.periodo)
    if (!f.soloCopertina) p.set('copertina', 'tutte')
    // Cambiando solo il testo l'ordine torna al suo default
    // (se l'utente non ne aveva scelto uno a mano)
    const ordineScelto = filtri.ordine !== ordineDefault(filtri.testo)
    const ordine =
      'testo' in modifiche && !('ordine' in modifiche) && !ordineScelto
        ? ordineDefault(f.testo)
        : f.ordine
    if (ordine !== ordineDefault(f.testo)) p.set('ordine', ordine)
    setParams(p, { replace: true })
    window.scrollTo({ top: 0 })
  }

  const filtriAttivi =
    !!filtri.testo || !!filtri.genere || filtri.periodo !== 'tutti' || !filtri.soloCopertina

  return (
    <div className={styles.pagina}>
      <motion.header
        className={styles.intestazione}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Heading as="h1" size="8" className={styles.titolo}>
          Catalogo
        </Heading>
        <Text as="p" size="3" color="gray">
          Milioni di titoli da Open Library. Quelli presenti in biblioteca mostrano se sono
          disponibili o in prestito.
        </Text>
      </motion.header>

      <BarraFiltri
        filtri={filtri}
        onCambia={aggiorna}
        onAzzera={() =>
          aggiorna({ testo: '', genere: '', periodo: 'tutti', soloCopertina: true })
        }
        filtriAttivi={filtriAttivi}
      />

      <Text as="p" size="2" color="gray" className={styles.conteggio} aria-live="polite">
        {catalogo.totale === null
          ? ' '
          : `${numero.format(catalogo.totale)} ${catalogo.totale === 1 ? 'libro' : 'libri'}`}
      </Text>

      {catalogo.totale === 0 ? (
        <Flex direction="column" align="center" gap="3" py="9" className={styles.vuoto}>
          <Heading as="h2" size="5">
            Nessun libro trovato
          </Heading>
          <Text color="gray">Prova con meno filtri o con parole diverse.</Text>
          {filtriAttivi && (
            <Button
              variant="soft"
              onClick={() => aggiorna({ testo: '', genere: '', periodo: 'tutti', soloCopertina: true })}
            >
              Azzera i filtri
            </Button>
          )}
        </Flex>
      ) : (
        <GrigliaLibri
          libri={catalogo.libri}
          caricamento={catalogo.caricamento}
          haAltre={catalogo.haAltre}
          onFine={catalogo.caricaAltri}
          onApri={setAperto}
          disponibilita={catalogo.biblioteca.perOpera}
        />
      )}

      {catalogo.errore && (
        <Callout.Root color="red" mt="4">
          <Callout.Text>
            Open Library non risponde ({catalogo.errore}).{' '}
            <Button size="1" variant="soft" color="red" onClick={catalogo.riprova}>
              <ReloadIcon /> Riprova
            </Button>
          </Callout.Text>
        </Callout.Root>
      )}

      {!catalogo.haAltre && catalogo.libri.length > 0 && (
        <Text as="p" size="2" color="gray" align="center" mt="6">
          Hai visto tutti i risultati.
        </Text>
      )}

      <TornaSu />
      <DettaglioLibro
        libro={aperto}
        biblioteca={catalogo.biblioteca}
        onChiudi={() => setAperto(null)}
      />
    </div>
  )
}

// Con lo scroll infinito la pagina diventa lunghissima: un pulsante riporta in cima
function TornaSu() {
  const { scrollY } = useScroll()
  const [visibile, setVisibile] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setVisibile(y > 1200))

  return (
    <AnimatePresence>
      {visibile && (
        <motion.div
          className={styles.tornaSu}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <IconButton
            size="3"
            radius="full"
            aria-label="Torna all'inizio"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUpIcon />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
