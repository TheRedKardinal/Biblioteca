import { api, type LibroBE } from './api'
import { chiaveIsbn, isbn13 } from './isbn'

// Copie della biblioteca per un'opera di Open Library. Un'opera ha molte edizioni
// (e quindi molti ISBN): la biblioteca puo' possederne piu' di una.
export type Disponibilita = {
  copieDisponibili: number
  copieTotali: number
  edizioni: LibroBE[]
}

// Incrocia gli ISBN delle opere con i libri del BE e restituisce solo le opere possedute
export async function disponibilitaPerOpere(
  isbnPerOpera: Map<string, string[]>,
  signal?: AbortSignal,
): Promise<Map<string, Disponibilita>> {
  // chiave ISBN -> opere che la contengono (lo stesso ISBN puo' stare in due opere)
  const opereDaIsbn = new Map<string, string[]>()
  for (const [opera, elenco] of isbnPerOpera) {
    for (const grezzo of elenco) {
      const n = isbn13(grezzo)
      if (!n) continue
      const chiave = chiaveIsbn(n)
      const opere = opereDaIsbn.get(chiave)
      if (!opere) opereDaIsbn.set(chiave, [opera])
      else if (!opere.includes(opera)) opere.push(opera)
    }
  }

  const risultato = new Map<string, Disponibilita>()
  if (opereDaIsbn.size === 0) return risultato

  const libri = await api.libriPerIsbn([...opereDaIsbn.keys()], signal)
  for (const libro of libri) {
    for (const opera of opereDaIsbn.get(chiaveIsbn(libro.isbn)) ?? []) {
      const d = risultato.get(opera) ?? { copieDisponibili: 0, copieTotali: 0, edizioni: [] }
      if (d.edizioni.some((e) => e.id === libro.id)) continue
      d.copieDisponibili += libro.copieDisponibili
      d.copieTotali += libro.copieTotali
      d.edizioni.push(libro)
      risultato.set(opera, d)
    }
  }
  return risultato
}
