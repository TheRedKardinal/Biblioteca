import { EnterIcon, HamburgerMenuIcon, MoonIcon, PersonIcon, SunIcon } from '@radix-ui/react-icons'
import { DropdownMenu, IconButton, Tooltip } from '@radix-ui/themes'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAspetto } from '@/theme/ThemeProvider'
import { Logo } from './Logo'
import styles from './Header.module.css'
import { vociAccount, vociPrincipali } from './navigazione'

const iconeAccount: Record<string, typeof EnterIcon> = {
  '/accedi': EnterIcon,
  '/registrati': PersonIcon,
}

export function Header() {
  const { aspetto, alterna } = useAspetto()
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const [staccato, setStaccato] = useState(false)

  // Sopra la hero l'header e' trasparente; appena si scorre prende sfondo e bordo
  useMotionValueEvent(scrollY, 'change', (y) => setStaccato(y > 8))

  const IconaTema = aspetto === 'light' ? MoonIcon : SunIcon
  const etichettaTema = aspetto === 'light' ? 'Tema scuro' : 'Tema chiaro'

  return (
    <motion.header
      className={styles.header}
      data-staccato={staccato}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className={styles.barra}>
        <div className={styles.sinistra}>
          <Logo />
        </div>

        <nav aria-label="Navigazione principale" className={styles.centro}>
          {vociPrincipali.map((v) => {
            const ancora = v.percorso.includes('#')
            return (
              <NavLink key={v.percorso} to={v.percorso} end className={styles.link}>
                {({ isActive }) => (
                  <>
                    {v.etichetta}
                    {isActive && !ancora && (
                      <motion.span layoutId="nav-indicatore" className={styles.indicatore} />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className={styles.destra}>
          <Tooltip content={etichettaTema}>
            <IconButton
              variant="ghost"
              color="gray"
              size="3"
              onClick={alterna}
              aria-label={etichettaTema}
              className={styles.soloDesktop}
            >
              <IconaTema />
            </IconButton>
          </Tooltip>

          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger>
              <IconButton variant="soft" size="3" aria-label="Apri il menu">
                <HamburgerMenuIcon width="18" height="18" />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" sideOffset={8} className={styles.menu}>
              {/* Su schermi stretti la navbar centrale sparisce e finisce qui */}
              <DropdownMenu.Group className={styles.soloMobile}>
                <DropdownMenu.Label>Esplora</DropdownMenu.Label>
                {vociPrincipali.map((v) => (
                  <DropdownMenu.Item key={v.percorso} onSelect={() => navigate(v.percorso)}>
                    {v.etichetta}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator />
              </DropdownMenu.Group>

              <DropdownMenu.Label>Account</DropdownMenu.Label>
              {vociAccount.map((v) => {
                const Icona = iconeAccount[v.percorso]
                return (
                  <DropdownMenu.Item key={v.percorso} onSelect={() => navigate(v.percorso)}>
                    {Icona && <Icona />} {v.etichetta}
                  </DropdownMenu.Item>
                )
              })}

              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={alterna}>
                <IconaTema /> {etichettaTema}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </motion.header>
  )
}
