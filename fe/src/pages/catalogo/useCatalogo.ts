import { useCallback, useEffect, useRef, useState } from 'react'
import { disponibilitaPerOpere, type Disponibilita } from '@/lib/disponibilita'
import { cercaLibri, type LibroOL, type Ordinamento } from '@/lib/openLibrary'

type Stato = {
  libri: LibroOL[]
  totale: number | null
  pagina: number // ultima pagina caricata
  haAltre: boolean
  caricamento: boolean
  errore: string | null
}

const INIZIALE: Stato = {
  libri: [],
  totale: null,
  pagina: 0,
  haAltre: true,
  caricamento: false,
  errore: null,
}

// Copie in biblioteca per opera, dal BE tramite ISBN.
// "verificate" distingue "non posseduta" da "verifica ancora in corso".
export type StatoBiblioteca = {
  perOpera: Map<string, Disponibilita>
  verificate: Set<string>
  errore: boolean
}

const BIBLIOTECA_INIZIALE: StatoBiblioteca = {
  perOpera: new Map(),
  verificate: new Set(),
  errore: false,
}

// Carica il catalogo a blocchi da 30. Un blocco alla volta: finche' una richiesta
// e' in corso le altre vengono ignorate. Se cambiano i filtri la richiesta in volo
// viene annullata e si riparte da capo.
// Ogni blocco mostrato viene poi incrociato col BE per ISBN, senza bloccare la griglia.
export function useCatalogo(q: string, ordinamento?: Ordinamento) {
  const [stato, setStato] = useState<Stato>(INIZIALE)
  const [biblioteca, setBiblioteca] = useState<StatoBiblioteca>(BIBLIOTECA_INIZIALE)
  const ctrl = useRef<AbortController | null>(null)
  // Annulla le verifiche sul BE ancora in corso quando cambiano i filtri
  const ctrlBiblioteca = useRef<AbortController | null>(null)
  const inVolo = useRef(false)
  // Open Library a volte ripete un'opera tra due pagine: le chiavi gia' viste si saltano
  const chiavi = useRef(new Set<string>())

  const verifica = useCallback(async (isbnPerOpera: Map<string, string[]>) => {
    const signal = ctrlBiblioteca.current?.signal
    const opere = [...isbnPerOpera.keys()]
    try {
      const trovate = await disponibilitaPerOpere(isbnPerOpera, signal)
      if (signal?.aborted) return
      setBiblioteca((b) => ({
        perOpera: new Map([...b.perOpera, ...trovate]),
        verificate: new Set([...b.verificate, ...opere]),
        errore: b.errore,
      }))
    } catch {
      if (signal?.aborted) return
      // BE spento o irraggiungibile: il catalogo resta usabile, senza disponibilita'
      setBiblioteca((b) => ({ ...b, errore: true }))
    }
  }, [])

  const carica = useCallback(
    async (pagina: number) => {
      if (inVolo.current) return
      inVolo.current = true
      const c = new AbortController()
      ctrl.current = c
      setStato((s) => ({ ...s, caricamento: true, errore: null }))

      try {
        const p = await cercaLibri({ q, pagina, ordinamento, conIsbn: true, signal: c.signal })
        const nuovi = p.libri.filter((l) => !chiavi.current.has(l.key))
        nuovi.forEach((l) => chiavi.current.add(l.key))
        setStato((s) => ({
          libri: [...s.libri, ...nuovi],
          totale: p.totale,
          pagina,
          haAltre: p.haAltre,
          caricamento: false,
          errore: null,
        }))
        // Solo gli ISBN delle opere nuove; poi la mappa si butta
        const isbn = new Map(nuovi.map((l) => [l.key, p.isbn?.get(l.key) ?? []]))
        if (isbn.size) verifica(isbn)
      } catch (e) {
        if (c.signal.aborted) return
        setStato((s) => ({
          ...s,
          caricamento: false,
          errore: e instanceof Error ? e.message : String(e),
        }))
      } finally {
        if (ctrl.current === c) inVolo.current = false
      }
    },
    [q, ordinamento, verifica],
  )

  // Nuovi filtri: si svuota tutto e si carica la prima pagina
  useEffect(() => {
    ctrl.current?.abort()
    ctrlBiblioteca.current?.abort()
    ctrlBiblioteca.current = new AbortController()
    inVolo.current = false
    chiavi.current = new Set()
    setStato(INIZIALE)
    setBiblioteca(BIBLIOTECA_INIZIALE)
    carica(1)
    return () => {
      ctrl.current?.abort()
      ctrlBiblioteca.current?.abort()
    }
  }, [carica])

  const caricaAltri = useCallback(() => {
    if (stato.haAltre && !stato.caricamento && !stato.errore) carica(stato.pagina + 1)
  }, [carica, stato.haAltre, stato.caricamento, stato.errore, stato.pagina])

  const riprova = useCallback(() => carica(stato.pagina + 1), [carica, stato.pagina])

  return { ...stato, biblioteca, caricaAltri, riprova }
}
