import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Entry point: mount the React app
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
