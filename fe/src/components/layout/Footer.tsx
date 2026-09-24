import { ClockIcon, EnvelopeClosedIcon, MobileIcon, SewingPinIcon } from '@radix-ui/react-icons'
import { Link as RadixLink, Text } from '@radix-ui/themes'
import { Link } from 'react-router'
import styles from './Footer.module.css'
import { Logo } from './Logo'
import { vociAccount, vociPrincipali } from './navigazione'

// Contatti di esempio: sostituire con quelli reali della biblioteca
const contatti = [
  { icona: SewingPinIcon, testo: 'Via dei Libri 1, 00100 Roma' },
  { icona: MobileIcon, testo: '+39 06 0000 0000', href: 'tel:+390600000000' },
  { icona: EnvelopeClosedIcon, testo: 'info@biblioteca.it', href: 'mailto:info@biblioteca.it' },
  { icona: ClockIcon, testo: 'Lun-Ven 9:00-19:00, Sab 9:00-13:00' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.griglia}>
        <div className={styles.marchio}>
          <Logo />
          <Text as="p" size="2" color="gray">
            Il catalogo della biblioteca sempre con te: cerca, controlla la disponibilità e segui i
            tuoi prestiti.
          </Text>
        </div>

        <nav aria-label="Navigazione secondaria" className={styles.colonna}>
          <Text as="p" size="2" weight="medium" className={styles.titolo}>
            Esplora
          </Text>
          {vociPrincipali.map((v) => (
            <RadixLink key={v.percorso} asChild size="2" color="gray">
              <Link to={v.percorso}>{v.etichetta}</Link>
            </RadixLink>
          ))}
        </nav>

        <nav aria-label="Account" className={styles.colonna}>
          <Text as="p" size="2" weight="medium" className={styles.titolo}>
            Account
          </Text>
          {vociAccount.map((v) => (
            <RadixLink key={v.percorso} asChild size="2" color="gray">
              <Link to={v.percorso}>{v.etichetta}</Link>
            </RadixLink>
          ))}
        </nav>

        <address className={styles.colonna}>
          <Text as="p" size="2" weight="medium" className={styles.titolo}>
            Contatti
          </Text>
          {contatti.map(({ icona: Icona, testo, href }) => (
            <Text key={testo} as="p" size="2" color="gray" className={styles.contatto}>
              <Icona aria-hidden="true" />
              {href ? (
                <RadixLink href={href} color="gray">
                  {testo}
                </RadixLink>
              ) : (
                testo
              )}
            </Text>
          ))}
        </address>
      </div>

      <div className={styles.fondo}>
        <Text size="1" color="gray">
          © {new Date().getFullYear()} Biblioteca
        </Text>
        <Text size="1" color="gray">
          Copertine e dati bibliografici:{' '}
          <RadixLink href="https://openlibrary.org" target="_blank" rel="noreferrer" size="1">
            Open Library
          </RadixLink>
        </Text>
      </div>
    </footer>
  )
}
