// In sviluppo BASE e' vuota e il proxy di Vite inoltra /api alla 8080.
// In produzione arriva da VITE_API_URL, iniettata durante la build.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export type Stato = {
  servizio: string
  database: string
  ora: string
}

async function chiama<T>(percorso: string, opzioni?: RequestInit): Promise<T> {
  const risposta = await fetch(`${BASE}${percorso}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opzioni,
  })
  if (!risposta.ok) {
    const testo = await risposta.text()
    throw new Error(testo || `${risposta.status} ${risposta.statusText}`)
  }
  return risposta.status === 204 ? (undefined as T) : ((await risposta.json()) as T)
}

// Speculare a LibroResponse del BE
export type LibroBE = {
  id: string
  isbn: number
  titolo: string
  autore: string
  edizione: string | null
  casaEditrice: string
  prezzo: number
  annoDiUscita: number
  copieTotali: number
  copieDisponibili: number
  copertinaRigida: boolean
  path: string | null
  genereId: string
  genere: string
}

// Tetto di IsbnRequest sul BE
const MAX_ISBN = 10000

export const api = {
  indirizzo: BASE || '(stessa origine, proxy di Vite)',
  stato: () => chiama<Stato>('/api/stato'),

  // Libri posseduti tra gli ISBN dati (quelli sconosciuti vengono ignorati)
  async libriPerIsbn(isbn: string[], signal?: AbortSignal): Promise<LibroBE[]> {
    const risultati: LibroBE[] = []
    for (let i = 0; i < isbn.length; i += MAX_ISBN) {
      const blocco = isbn.slice(i, i + MAX_ISBN).map(Number)
      risultati.push(
        ...(await chiama<LibroBE[]>('/api/book/byIsbn', {
          method: 'POST',
          body: JSON.stringify({ isbn: blocco }),
          signal,
        })),
      )
    }
    return risultati
  },
}
