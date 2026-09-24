// Client della Search API di Open Library (https://openlibrary.org/dev/docs/api/search).
// Restituisce solo opere (works) con copertina e autore: niente autori, liste o
// pagine di soggetto, e niente voci incomplete che romperebbero la griglia.

const SEARCH_URL = 'https://openlibrary.org/search.json'
const CAMPI = 'key,title,author_name,cover_i,first_publish_year'

// Tetto per ogni richiesta: le pagine del catalogo non superano mai 30 libri,
// cosi' DOM e memoria restano leggeri anche con lo scroll infinito.
export const MAX_PER_PAGINA = 30

export type LibroOL = {
  key: string
  titolo: string
  autori: string[]
  anno?: number
  copertinaId: number
}

type DocOL = {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
}

export type PaginaOL = {
  libri: LibroOL[]
  totale: number
  pagina: number
  haAltre: boolean
}

export type Ordinamento = 'readinglog' | 'rating' | 'new' | 'old' | 'title'

export type CercaParams = {
  q: string
  pagina?: number
  perPagina?: number
  ordinamento?: Ordinamento
  signal?: AbortSignal
}

export async function cercaLibri({
  q,
  pagina = 1,
  perPagina = MAX_PER_PAGINA,
  ordinamento,
  signal,
}: CercaParams): Promise<PaginaOL> {
  const limite = Math.min(Math.max(perPagina, 1), MAX_PER_PAGINA)
  const params = new URLSearchParams({
    q,
    fields: CAMPI,
    limit: String(limite),
    page: String(pagina),
  })
  if (ordinamento) params.set('sort', ordinamento)

  const risposta = await fetch(`${SEARCH_URL}?${params}`, { signal })
  if (!risposta.ok) throw new Error(`Open Library: ${risposta.status} ${risposta.statusText}`)
  const dati = (await risposta.json()) as { numFound: number; docs: DocOL[] }

  const libri = dati.docs
    .filter((d) => d.key.startsWith('/works/') && d.cover_i && d.author_name?.length)
    .map((d) => ({
      key: d.key,
      titolo: d.title,
      autori: d.author_name!,
      anno: d.first_publish_year,
      copertinaId: d.cover_i!,
    }))

  return {
    libri,
    totale: dati.numFound,
    pagina,
    haAltre: pagina * limite < dati.numFound,
  }
}

export function urlCopertina(id: number, taglia: 'S' | 'M' | 'L' = 'M') {
  return `https://covers.openlibrary.org/b/id/${id}-${taglia}.jpg`
}
