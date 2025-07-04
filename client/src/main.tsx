import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom';
// import './index.css'
import App from './App.tsx'
import { store } from './store/store.tsx'
import { Provider } from 'react-redux'
import { DataProvider } from './Context/DataContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store} >
        <DataProvider>  <App />  </DataProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
