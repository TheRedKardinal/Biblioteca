import { Theme } from '@radix-ui/themes'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Aspetto = 'light' | 'dark'

const CHIAVE = 'biblioteca.aspetto'

type Ctx = { aspetto: Aspetto; alterna: () => void }
const AspettoContext = createContext<Ctx | null>(null)

function aspettoIniziale(): Aspetto {
  try {
    const salvato = localStorage.getItem(CHIAVE)
    if (salvato === 'light' || salvato === 'dark') return salvato
  } catch {
    // storage non disponibile (navigazione privata)
  }
  // Si parte sempre dal chiaro: lo scuro e' una scelta esplicita dell'utente
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [aspetto, setAspetto] = useState<Aspetto>(aspettoIniziale)

  useEffect(() => {
    // La classe su <html> colora anche lo sfondo fuori dall'albero di Radix
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(aspetto)
    try {
      localStorage.setItem(CHIAVE, aspetto)
    } catch {
      // ignorato: la scelta vale solo per questa sessione
    }
  }, [aspetto])

  const alterna = () => setAspetto((a) => (a === 'light' ? 'dark' : 'light'))

  return (
    <AspettoContext.Provider value={{ aspetto, alterna }}>
      <Theme
        appearance={aspetto}
        accentColor="jade"
        grayColor="sage"
        radius="large"
        panelBackground="translucent"
      >
        {children}
      </Theme>
    </AspettoContext.Provider>
  )
}

export function useAspetto() {
  const ctx = useContext(AspettoContext)
  if (!ctx) throw new Error('useAspetto va usato dentro ThemeProvider')
  return ctx
}
