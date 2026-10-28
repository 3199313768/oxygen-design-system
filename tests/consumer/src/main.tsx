import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@oxygen-design/ui';
import '@oxygen-design/ui/styles.css';
import '@oxygen-design/ui/tokens.css';

function App() {
  return (
    <main>
      <Button>消费验证</Button>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
