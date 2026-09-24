// Client della Search API di Open Library (https://openlibrary.org/dev/docs/api/search).
// Restituisce solo opere (works), cioe' libri: niente autori, liste o pagine di soggetto.

const BASE = 'https://openlibrary.org'
const CAMPI = 'key,title,author_name,cover_i,first_publish_year'

// Tetto per ogni richiesta: i blocchi del catalogo non superano mai 30 libri,
// cosi' ogni caricamento resta leggero per rete, memoria e CPU.
export const MAX_PER_PAGINA = 30

export type LibroOL = {
  key: string
  titolo: string
  autori: string[]
  anno?: number
  copertinaId?: number
}

type DocOL = {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
  isbn?: string[]
}

export type PaginaOL = {
  libri: LibroOL[]
  totale: number
  pagina: number
  haAltre: boolean
  // Solo con conIsbn: ISBN di tutte le edizioni, per opera. Serve a incrociare il
  // catalogo con i libri del BE e non va conservato (sono migliaia di stringhe).
  isbn?: Map<string, string[]>
}

export type Ordinamento = 'readinglog' | 'rating' | 'new' | 'old' | 'title'

export type CercaParams = {
  q: string
  pagina?: number
  perPagina?: number
  ordinamento?: Ordinamento
  conIsbn?: boolean
  signal?: AbortSignal
}

export async function cercaLibri({
  q,
  pagina = 1,
  perPagina = MAX_PER_PAGINA,
  ordinamento,
  conIsbn = false,
  signal,
}: CercaParams): Promise<PaginaOL> {
  const limite = Math.min(Math.max(perPagina, 1), MAX_PER_PAGINA)
  const params = new URLSearchParams({
    q,
    fields: conIsbn ? `${CAMPI},isbn` : CAMPI,
    limit: String(limite),
    page: String(pagina),
  })
  if (ordinamento) params.set('sort', ordinamento)

  const risposta = await fetch(`${BASE}/search.json?${params}`, { signal })
  if (!risposta.ok) throw new Error(`Open Library: ${risposta.status} ${risposta.statusText}`)
  const dati = (await risposta.json()) as { numFound: number; docs: DocOL[] }

  const opere = dati.docs.filter((d) => d.key.startsWith('/works/'))
  const libri = opere.map((d) => ({
    key: d.key,
    titolo: d.title,
    autori: d.author_name ?? [],
    anno: d.first_publish_year,
    copertinaId: d.cover_i,
  }))

  return {
    libri,
    totale: dati.numFound,
    pagina,
    haAltre: pagina * limite < dati.numFound,
    isbn: conIsbn ? new Map(opere.map((d) => [d.key, d.isbn ?? []])) : undefined,
  }
}

// ---------- Filtri del catalogo -> query di Open Library ----------

export type Periodo = 'tutti' | 'pre1900' | '1900-1949' | '1950-1999' | '2000'

export type Filtri = {
  testo: string
  genere: string // soggetto di Open Library, '' = tutti
  periodo: Periodo
  soloCopertina: boolean
}

// Le etichette sono in italiano, i soggetti sono quelli (inglesi) di Open Library
export const GENERI = [
  { valore: 'fiction', etichetta: 'Narrativa' },
  { valore: 'classic literature', etichetta: 'Classici' },
  { valore: 'mystery', etichetta: 'Gialli' },
  { valore: 'thriller', etichetta: 'Thriller' },
  { valore: 'fantasy', etichetta: 'Fantasy' },
  { valore: 'science fiction', etichetta: 'Fantascienza' },
  { valore: 'historical fiction', etichetta: 'Romanzi storici' },
  { valore: 'romance', etichetta: 'Rosa' },
  { valore: 'horror', etichetta: 'Horror' },
  { valore: 'juvenile fiction', etichetta: 'Ragazzi' },
  { valore: 'poetry', etichetta: 'Poesia' },
  { valore: 'history', etichetta: 'Storia' },
  { valore: 'biography', etichetta: 'Biografie' },
  { valore: 'philosophy', etichetta: 'Filosofia' },
  { valore: 'science', etichetta: 'Scienza' },
  { valore: 'art', etichetta: 'Arte' },
  { valore: 'cooking', etichetta: 'Cucina' },
] as const

export const PERIODI: { valore: Periodo; etichetta: string; intervallo?: string }[] = [
  { valore: 'tutti', etichetta: 'Qualsiasi anno' },
  { valore: 'pre1900', etichetta: 'Prima del 1900', intervallo: '[* TO 1899]' },
  { valore: '1900-1949', etichetta: '1900 - 1949', intervallo: '[1900 TO 1949]' },
  { valore: '1950-1999', etichetta: '1950 - 1999', intervallo: '[1950 TO 1999]' },
  { valore: '2000', etichetta: 'Dal 2000', intervallo: '[2000 TO *]' },
]

export function costruisciQuery({ testo, genere, periodo, soloCopertina }: Filtri): string {
  const parti: string[] = []
  const t = testo.trim()
  if (t) parti.push(t)
  if (genere) parti.push(`subject:"${genere}"`)
  const intervallo = PERIODI.find((p) => p.valore === periodo)?.intervallo
  if (intervallo) parti.push(`first_publish_year:${intervallo}`)
  if (soloCopertina) parti.push('cover_i:[1 TO *]')
  // Senza nessun filtro: tutte le opere con un anno di pubblicazione (decine di milioni)
  if (!t && !genere && !intervallo) parti.push('first_publish_year:[* TO *]')
  return parti.join(' ')
}

// ---------- Dettaglio di un'opera ----------

export type DettaglioOL = {
  descrizione?: string
  soggetti: string[]
}

export async function dettaglioOpera(key: string, signal?: AbortSignal): Promise<DettaglioOL> {
  const risposta = await fetch(`${BASE}${key}.json`, { signal })
  if (!risposta.ok) throw new Error(`Open Library: ${risposta.status} ${risposta.statusText}`)
  const dati = (await risposta.json()) as {
    description?: string | { value: string }
    subjects?: string[]
  }
  const descrizione =
    typeof dati.description === 'string' ? dati.description : dati.description?.value
  return {
    // Molte descrizioni contengono link markdown e note di fonte: si tiene solo il testo
    descrizione: descrizione
      ?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\r/g, '')
      .split(/\n-{3,}\n|\n\(\[source\]/)[0]
      .trim(),
    soggetti: dati.subjects ?? [],
  }
}

export function urlCopertina(id: number, taglia: 'S' | 'M' | 'L' = 'M') {
  return `https://covers.openlibrary.org/b/id/${id}-${taglia}.jpg`
}

export function urlOpera(key: string) {
  return `${BASE}${key}`
}
