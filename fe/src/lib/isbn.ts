// Il BE salva l'ISBN come numero a 13 cifre (NUMERIC(13,0)): tutto viene portato
// alla forma ISBN-13 e confrontato come stringa numerica senza zeri iniziali.

export function isbn13(grezzo: string): string | null {
  const s = grezzo.replace(/[^0-9Xx]/g, '').toUpperCase()
  if (/^\d{13}$/.test(s)) return s
  if (/^\d{9}[\dX]$/.test(s)) {
    const base = '978' + s.slice(0, 9)
    const somma = [...base].reduce((acc, c, i) => acc + Number(c) * (i % 2 ? 3 : 1), 0)
    return base + ((10 - (somma % 10)) % 10)
  }
  return null
}

// Chiave di confronto: JSON restituisce l'ISBN come numero, quindi senza zeri iniziali
export function chiaveIsbn(isbn: string | number): string {
  return String(isbn).replace(/^0+/, '')
}
