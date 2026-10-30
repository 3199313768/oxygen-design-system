import React from 'react';
import ReactDOM from 'react-dom/client';
import { EmptyState } from '@oxygen-design/patterns';
import '@oxygen-design/ui/styles.css';
import '@oxygen-design/ui/tokens.css';
import '@oxygen-design/patterns/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EmptyState description="安装包可正常渲染。" title="暂无内容" />
  </React.StrictMode>,
);
