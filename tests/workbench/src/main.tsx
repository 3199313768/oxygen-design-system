import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@oxygen-design/ui/styles.css';
import '@oxygen-design/ui/tokens.css';
import '@oxygen-design/patterns/styles.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
