import { Cross2Icon, MagnifyingGlassIcon, ResetIcon } from '@radix-ui/react-icons'
import { Button, Flex, IconButton, Select, Switch, Text, TextField } from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { GENERI, PERIODI, type Filtri, type Ordinamento, type Periodo } from '@/lib/openLibrary'
import styles from './BarraFiltri.module.css'

export type Ordine = Ordinamento | 'pertinenza'

export const ORDINAMENTI: { valore: Ordine; etichetta: string }[] = [
  { valore: 'readinglog', etichetta: 'Più letti' },
  { valore: 'rating', etichetta: 'Più apprezzati' },
  { valore: 'pertinenza', etichetta: 'Pertinenza' },
  { valore: 'new', etichetta: 'Più recenti' },
  { valore: 'old', etichetta: 'Meno recenti' },
  { valore: 'title', etichetta: 'Titolo A-Z' },
]

// Radix Select non accetta valori vuoti: "tutti" rappresenta il filtro spento
const TUTTI = 'tutti'
const ATTESA_DIGITAZIONE = 400 // ms

type Props = {
  filtri: Filtri & { ordine: Ordine }
  onCambia: (modifiche: Partial<Filtri & { ordine: Ordine }>) => void
  onAzzera: () => void
  filtriAttivi: boolean
}

export function BarraFiltri({ filtri, onCambia, onAzzera, filtriAttivi }: Props) {
  const [testo, setTesto] = useState(filtri.testo)
  // onCambia cambia a ogni render: il timer legge sempre l'ultima versione dal ref
  const onCambiaRef = useRef(onCambia)
  useEffect(() => {
    onCambiaRef.current = onCambia
  })

  // Filtri azzerati o link esterno: il campo si riallinea all'URL
  useEffect(() => setTesto(filtri.testo), [filtri.testo])

  // La ricerca parte quando si smette di scrivere, non a ogni tasto
  useEffect(() => {
    if (testo.trim() === filtri.testo.trim()) return
    const t = setTimeout(() => onCambiaRef.current({ testo }), ATTESA_DIGITAZIONE)
    return () => clearTimeout(t)
  }, [testo, filtri.testo])

  return (
    <div className={styles.barra}>
      <form
        role="search"
        className={styles.ricerca}
        onSubmit={(e) => {
          e.preventDefault()
          onCambia({ testo })
        }}
      >
        <TextField.Root
          size="3"
          placeholder="Titolo, autore, ISBN..."
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          aria-label="Cerca nel catalogo"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
          {testo && (
            <TextField.Slot>
              <IconButton
                type="button"
                size="1"
                variant="ghost"
                color="gray"
                aria-label="Cancella la ricerca"
                onClick={() => {
                  setTesto('')
                  onCambia({ testo: '' })
                }}
              >
                <Cross2Icon />
              </IconButton>
            </TextField.Slot>
          )}
        </TextField.Root>
      </form>

      <Flex gap="3" wrap="wrap" align="center" className={styles.filtri}>
        <Select.Root
          value={filtri.genere || TUTTI}
          onValueChange={(v) => onCambia({ genere: v === TUTTI ? '' : v })}
        >
          <Select.Trigger aria-label="Genere" className={styles.select} />
          <Select.Content position="popper">
            <Select.Item value={TUTTI}>Tutti i generi</Select.Item>
            <Select.Separator />
            {GENERI.map((g) => (
              <Select.Item key={g.valore} value={g.valore}>
                {g.etichetta}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root value={filtri.periodo} onValueChange={(v) => onCambia({ periodo: v as Periodo })}>
          <Select.Trigger aria-label="Periodo di pubblicazione" className={styles.select} />
          <Select.Content position="popper">
            {PERIODI.map((p) => (
              <Select.Item key={p.valore} value={p.valore}>
                {p.etichetta}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root value={filtri.ordine} onValueChange={(v) => onCambia({ ordine: v as Ordine })}>
          <Select.Trigger aria-label="Ordina per" className={styles.select} />
          <Select.Content position="popper">
            {ORDINAMENTI.map((o) => (
              <Select.Item key={o.valore} value={o.valore}>
                {o.etichetta}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Text as="label" size="2" className={styles.interruttore}>
          <Switch
            checked={filtri.soloCopertina}
            onCheckedChange={(v) => onCambia({ soloCopertina: v })}
          />
          Solo con copertina
        </Text>

        {filtriAttivi && (
          <Button variant="ghost" color="gray" onClick={onAzzera} className={styles.azzera}>
            <ResetIcon /> Azzera
          </Button>
        )}
      </Flex>
    </div>
  )
}
