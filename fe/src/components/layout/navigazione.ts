// Voci condivise da header, menu hamburger e footer.
// Rispecchiano le funzioni del backend: catalogo e generi pubblici,
// prestiti dell'utente autenticato (/api/prestiti/UserPrestiti).
export type Voce = { etichetta: string; percorso: string }

export const vociPrincipali: Voce[] = [
  { etichetta: 'Catalogo', percorso: '/catalogo' },
  { etichetta: 'Generi', percorso: '/generi' },
  { etichetta: 'I miei prestiti', percorso: '/prestiti' },
  { etichetta: 'Come funziona', percorso: '/#come-funziona' },
]

export const vociAccount: Voce[] = [
  { etichetta: 'Accedi', percorso: '/accedi' },
  { etichetta: 'Registrati', percorso: '/registrati' },
]
