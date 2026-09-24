import { useState } from 'react'
import { urlCopertina, type LibroOL } from '@/lib/openLibrary'
import styles from './CopertinaLibro.module.css'

type Props = {
  libro: LibroOL
  taglia?: 'M' | 'L'
  className?: string
}

// Copertina di Open Library con dissolvenza al caricamento.
// Se manca (o non si carica) disegna una copertina tipografica con titolo e autore.
export function CopertinaLibro({ libro, taglia = 'M', className }: Props) {
  const [stato, setStato] = useState<'carico' | 'ok' | 'errore'>('carico')
  const classi = `${styles.copertina} ${className ?? ''}`

  if (!libro.copertinaId || stato === 'errore') {
    return (
      <div className={`${classi} ${styles.segnaposto}`} role="img" aria-label={libro.titolo}>
        <span className={styles.titolo}>{libro.titolo}</span>
        {libro.autori[0] && <span className={styles.autore}>{libro.autori[0]}</span>}
      </div>
    )
  }

  return (
    <div className={classi}>
      <img
        src={urlCopertina(libro.copertinaId, taglia)}
        alt={`Copertina di ${libro.titolo}`}
        loading="lazy"
        decoding="async"
        data-caricata={stato === 'ok'}
        onLoad={() => setStato('ok')}
        onError={() => setStato('errore')}
      />
    </div>
  )
}
