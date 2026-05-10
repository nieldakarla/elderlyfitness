import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './state/store.jsx';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter basename="/elderlyfitness">
        <App />
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>,
);
