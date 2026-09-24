import { Badge, Skeleton, Text } from '@radix-ui/themes'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CopertinaLibro } from '@/components/libro/CopertinaLibro'
import type { Disponibilita } from '@/lib/disponibilita'
import type { LibroOL } from '@/lib/openLibrary'
import styles from './GrigliaLibri.module.css'

const LARGHEZZA_MIN = 150 // px minimi di una scheda: decide quante colonne entrano
const SPAZIO = 24 // gap tra le schede (deve combaciare col CSS)
const TESTO = 76 // altezza del blocco titolo/autore/anno sotto la copertina
const RIGHE_SCHELETRO = 2

type Props = {
  libri: LibroOL[]
  caricamento: boolean
  haAltre: boolean
  onFine: () => void
  onApri: (libro: LibroOL) => void
  disponibilita: Map<string, Disponibilita>
}

// Griglia virtualizzata: nel DOM ci sono solo le righe visibili (piu' qualcuna di
// scorta). Scorrendo, le righe uscite vengono smontate e le loro immagini liberate,
// quindi memoria e CPU restano costanti anche dopo migliaia di libri.
export function GrigliaLibri({
  libri,
  caricamento,
  haAltre,
  onFine,
  onApri,
  disponibilita,
}: Props) {
  const contenitore = useRef<HTMLDivElement>(null)
  const [larghezza, setLarghezza] = useState(0)
  const [offset, setOffset] = useState(0)

  useLayoutEffect(() => {
    const el = contenitore.current
    if (!el) return
    const misura = () => {
      setLarghezza(el.clientWidth)
      setOffset(el.getBoundingClientRect().top + window.scrollY)
    }
    misura()
    const ro = new ResizeObserver(misura)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const colonne = Math.max(2, Math.floor((larghezza + SPAZIO) / (LARGHEZZA_MIN + SPAZIO)))
  const larghezzaScheda = larghezza ? (larghezza - SPAZIO * (colonne - 1)) / colonne : LARGHEZZA_MIN
  const righeLibri = Math.ceil(libri.length / colonne)
  const righeScheletro = caricamento ? (libri.length ? 1 : RIGHE_SCHELETRO) : 0
  const righe = righeLibri + righeScheletro

  const virtualizer = useWindowVirtualizer({
    count: righe,
    estimateSize: () => larghezzaScheda * 1.5 + TESTO + SPAZIO,
    overscan: 3,
    scrollMargin: offset,
  })

  // Cambiano le colonne: le altezze stimate non valgono piu'
  useEffect(() => {
    virtualizer.measure()
  }, [colonne, larghezzaScheda, virtualizer])

  const elementi = virtualizer.getVirtualItems()
  const ultima = elementi.at(-1)?.index ?? -1

  // A due righe dalla fine si chiede il blocco successivo
  useEffect(() => {
    if (haAltre && !caricamento && ultima >= righeLibri - 2) onFine()
  }, [ultima, righeLibri, haAltre, caricamento, onFine])

  return (
    <div ref={contenitore} className={styles.contenitore}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {elementi.map((riga) => {
          const primo = riga.index * colonne
          const inCaricamento = riga.index >= righeLibri
          return (
            <div
              key={riga.key}
              ref={virtualizer.measureElement}
              data-index={riga.index}
              className={styles.riga}
              style={{
                gridTemplateColumns: `repeat(${colonne}, minmax(0, 1fr))`,
                transform: `translateY(${riga.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              {inCaricamento
                ? Array.from({ length: colonne }, (_, i) => <SchedaScheletro key={i} />)
                : libri
                    .slice(primo, primo + colonne)
                    .map((l) => (
                      <Scheda
                        key={l.key}
                        libro={l}
                        disp={disponibilita.get(l.key)}
                        onApri={onApri}
                      />
                    ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

type SchedaProps = {
  libro: LibroOL
  disp?: Disponibilita
  onApri: (l: LibroOL) => void
}

function Scheda({ libro, disp, onApri }: SchedaProps) {
  return (
    <button type="button" className={styles.scheda} onClick={() => onApri(libro)}>
      <span className={styles.cornice}>
        <CopertinaLibro libro={libro} className={styles.copertina} />
        {disp && (
          <Badge
            size="1"
            variant="solid"
            color={disp.copieDisponibili > 0 ? 'jade' : 'gray'}
            className={styles.stato}
          >
            {disp.copieDisponibili > 0 ? 'Disponibile' : 'In prestito'}
          </Badge>
        )}
      </span>
      <span className={styles.testo}>
        <Text as="span" size="2" weight="medium" className={styles.titolo}>
          {libro.titolo}
        </Text>
        <Text as="span" size="1" color="gray" className={styles.autore}>
          {libro.autori[0] ?? 'Autore sconosciuto'}
          {libro.anno ? ` · ${libro.anno}` : ''}
        </Text>
      </span>
    </button>
  )
}

function SchedaScheletro() {
  return (
    <div className={styles.scheda} aria-hidden="true">
      <Skeleton className={styles.copertinaScheletro} />
      <span className={styles.testo}>
        <Skeleton height="14px" width="90%" />
        <Skeleton height="12px" width="60%" />
      </span>
    </div>
  )
}
