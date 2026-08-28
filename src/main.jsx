import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initTheme } from './lib/theme.js'
import { useWorkspace } from './state/workspaceStore.js'
import { usePartsLibrary } from './state/partsLibraryStore.js'

initTheme()

if (import.meta.env.DEV) {
  window.__cf = { workspace: useWorkspace, parts: usePartsLibrary }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
