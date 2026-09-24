import { Cross2Icon, ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Badge,
  Button,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  Skeleton,
  Text,
} from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { CopertinaLibro } from '@/components/libro/CopertinaLibro'
import { dettaglioOpera, urlOpera, type DettaglioOL, type LibroOL } from '@/lib/openLibrary'
import styles from './DettaglioLibro.module.css'
import { InBiblioteca } from './InBiblioteca'
import type { StatoBiblioteca } from './useCatalogo'

const MAX_SOGGETTI = 8

type Props = {
  libro: LibroOL | null
  biblioteca: StatoBiblioteca
  onChiudi: () => void
}

export function DettaglioLibro({ libro, biblioteca, onChiudi }: Props) {
  // Durante l'animazione di chiusura libro e' gia' null: si mostra l'ultimo aperto
  const ultimo = useRef<LibroOL | null>(null)
  if (libro) ultimo.current = libro
  const mostrato = libro ?? ultimo.current

  return (
    <Dialog.Root open={libro !== null} onOpenChange={(aperto) => !aperto && onChiudi()}>
      <Dialog.Content maxWidth="760px" className={styles.contenuto} aria-describedby={undefined}>
        {mostrato && <Corpo libro={mostrato} biblioteca={biblioteca} />}
        <Dialog.Close>
          <IconButton variant="ghost" color="gray" aria-label="Chiudi" className={styles.chiudi}>
            <Cross2Icon />
          </IconButton>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}

function Corpo({ libro, biblioteca }: { libro: LibroOL; biblioteca: StatoBiblioteca }) {
  const [dettaglio, setDettaglio] = useState<DettaglioOL | null>(null)
  const [errore, setErrore] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    setDettaglio(null)
    setErrore(false)
    dettaglioOpera(libro.key, ctrl.signal)
      .then(setDettaglio)
      .catch(() => !ctrl.signal.aborted && setErrore(true))
    return () => ctrl.abort()
  }, [libro.key])

  return (
    <div className={styles.griglia}>
      <CopertinaLibro libro={libro} taglia="L" className={styles.copertina} />

      <Flex direction="column" gap="3" minWidth="0">
        <div>
          <Dialog.Title size="7" mb="1" className={styles.titolo}>
            {libro.titolo}
          </Dialog.Title>
          <Text as="p" size="3" color="gray">
            {libro.autori.length ? libro.autori.slice(0, 3).join(', ') : 'Autore sconosciuto'}
          </Text>
        </div>

        {libro.anno && (
          <Flex gap="2">
            <Badge variant="soft" color="gray">
              Prima edizione {libro.anno}
            </Badge>
          </Flex>
        )}

        <InBiblioteca
          disp={biblioteca.perOpera.get(libro.key)}
          verificata={biblioteca.verificate.has(libro.key)}
          errore={biblioteca.errore}
        />

        <ScrollArea type="auto" scrollbars="vertical" className={styles.descrizione}>
          {dettaglio ? (
            <Text as="p" size="2" className={styles.testo}>
              {dettaglio.descrizione || 'Nessuna descrizione disponibile per questo titolo.'}
            </Text>
          ) : errore ? (
            <Text as="p" size="2" color="gray">
              Non è stato possibile caricare la descrizione.
            </Text>
          ) : (
            <Flex direction="column" gap="2">
              <Skeleton height="14px" />
              <Skeleton height="14px" />
              <Skeleton height="14px" width="70%" />
            </Flex>
          )}
        </ScrollArea>

        {dettaglio && dettaglio.soggetti.length > 0 && (
          <Flex gap="2" wrap="wrap">
            {dettaglio.soggetti.slice(0, MAX_SOGGETTI).map((s) => (
              <Badge key={s} variant="surface" radius="full">
                {s}
              </Badge>
            ))}
          </Flex>
        )}

        <Flex gap="3" mt="auto" pt="2" wrap="wrap">
          <Button asChild variant="soft">
            <a href={urlOpera(libro.key)} target="_blank" rel="noreferrer">
              Scheda su Open Library <ExternalLinkIcon />
            </a>
          </Button>
        </Flex>
      </Flex>
    </div>
  )
}
