import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async' // 1. Import the provider
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider> {/* 2. Wrap your App */}
      <App />
    </HelmetProvider>
  </StrictMode>,
)