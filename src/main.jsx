import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initTranslateState } from './utils/translate.js'

initTranslateState()

const storedTheme = localStorage.getItem('es_runaba_theme')
if (storedTheme === 'dark') {
  document.documentElement.classList.add('dark')
  document.documentElement.style.colorScheme = 'dark'
} else {
  document.documentElement.style.colorScheme = 'light'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
