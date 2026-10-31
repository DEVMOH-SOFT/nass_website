import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Automatically refresh stale background browser tabs when a newer deployment is live
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  const getLoadedBundleSrc = (): string | null => {
    const script = document.querySelector('script[type="module"][src*="/assets/index-"]') as HTMLScriptElement | null
    return script ? new URL(script.src, window.location.origin).pathname : null
  }

  const currentBundle = getLoadedBundleSrc()
  const checkForUpdatedDeployment = async () => {
    if (!currentBundle) return
    try {
      const res = await fetch(`/?_v=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) return
      const html = await res.text()
      const match = html.match(/\/assets\/index-[^"']+\.js/)
      if (match && match[0] !== currentBundle) {
        window.location.reload()
      }
    } catch {}
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdatedDeployment()
    }
  })
  window.addEventListener('focus', checkForUpdatedDeployment)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
