import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import {Provider} from 'react-redux';

import { UserProvider,TitleProvider } from "./contexts";
import '/mock'
import store from './store/index.js';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <UserProvider>
        <TitleProvider>
          <App />
        </TitleProvider>
      </UserProvider>
    </Provider>
  </StrictMode>,
)
