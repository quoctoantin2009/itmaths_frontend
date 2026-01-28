import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // 1. Import HashRouter
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Bọc App trong HashRouter để chạy được trên điện thoại */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)