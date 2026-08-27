import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './theme/daypicker.css'
import App from './App.tsx'
import { store } from './store'
import { applyThemeMode, getStoredMode, ThemeModeProvider } from './theme/ThemeModeContext'

// Antes de montar React, para que no haya un parpadeo del tema por defecto
// (oscuro) mientras carga el primer render.
applyThemeMode(getStoredMode())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeModeProvider>
  </StrictMode>,
)
