// Solo le palette usate (jade, sage, rosso per gli errori): styles.css le include tutte
import '@radix-ui/themes/tokens/base.css'
import '@radix-ui/themes/tokens/colors/gray.css'
import '@radix-ui/themes/tokens/colors/sage.css'
import '@radix-ui/themes/tokens/colors/jade.css'
import '@radix-ui/themes/tokens/colors/red.css'
import '@radix-ui/themes/components.css'
import '@radix-ui/themes/utilities.css'
import './index.css'
import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { ThemeProvider } from './theme/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        {/* reducedMotion="user": con "riduci movimento" attivo nel sistema le animazioni si spengono */}
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
