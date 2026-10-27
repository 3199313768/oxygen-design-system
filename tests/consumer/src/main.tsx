import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button, EmptyState, PageHeader } from '@oxygen-design/ui';
import '@oxygen-design/ui/styles.css';
import '@oxygen-design/ui/tokens.css';

function App() {
  return (
    <main>
      <PageHeader actions={<Button>新建</Button>} title="消费验证" />
      <EmptyState description="安装包可正常渲染。" title="暂无内容" />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
