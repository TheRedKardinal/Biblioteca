import { CheckCircledIcon, ClockIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import { Callout, Flex, Skeleton, Text } from '@radix-ui/themes'
import type { Disponibilita } from '@/lib/disponibilita'
import styles from './InBiblioteca.module.css'

type Props = {
  disp?: Disponibilita
  verificata: boolean
  errore: boolean
}

// Copie della biblioteca per l'opera aperta (BE, abbinate per ISBN)
export function InBiblioteca({ disp, verificata, errore }: Props) {
  if (disp) {
    const libere = disp.copieDisponibili > 0
    return (
      <Callout.Root color={libere ? 'jade' : 'gray'} variant="surface" className={styles.box}>
        <Callout.Icon>{libere ? <CheckCircledIcon /> : <ClockIcon />}</Callout.Icon>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {libere
              ? `Disponibile in biblioteca: ${disp.copieDisponibili} ${disp.copieDisponibili === 1 ? 'copia' : 'copie'} su ${disp.copieTotali}`
              : `In biblioteca, ma tutte le ${disp.copieTotali} copie sono in prestito`}
          </Text>
          <ul className={styles.edizioni}>
            {disp.edizioni.map((e) => (
              <li key={e.id}>
                <Text size="1" color="gray">
                  {e.casaEditrice}, {e.annoDiUscita}
                  {e.edizione ? ` · ${e.edizione}` : ''} ·{' '}
                  {e.copertinaRigida ? 'copertina rigida' : 'brossura'} · ISBN {e.isbn}
                  {disp.edizioni.length > 1 ? ` · ${e.copieDisponibili}/${e.copieTotali} libere` : ''}
                </Text>
              </li>
            ))}
          </ul>
          <Text size="1" color="gray">
            Il prestito si richiede al banco: lo registra il bibliotecario.
          </Text>
        </Flex>
      </Callout.Root>
    )
  }

  if (errore) {
    return (
      <Callout.Root color="gray" variant="surface" size="1">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>Disponibilità in biblioteca non verificabile in questo momento.</Callout.Text>
      </Callout.Root>
    )
  }

  if (!verificata) return <Skeleton height="44px" />

  return (
    <Callout.Root color="gray" variant="surface" size="1">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>Questo titolo non è nel catalogo della biblioteca.</Callout.Text>
    </Callout.Root>
  )
}
