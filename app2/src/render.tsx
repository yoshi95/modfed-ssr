import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'

export default () => {
  const container = document.getElementById('app2')
  const root = createRoot(container)
  root.render(<App />)
}

