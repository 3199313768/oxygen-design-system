import { useState } from 'react';

export function CodeSample({ code }: { code: string }) {
  const [result, setResult] = useState({ code: '', message: '' });
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code);
      setResult({ code, message: '代码已复制。' });
    } catch {
      setResult({ code, message: '复制失败，请选中下方代码手动复制。' });
    }
  }
  return (
    <div className="oxygen-docs-code">
      <div className="oxygen-docs-code__toolbar">
        <button type="button" onClick={() => { void copy(); }}>复制代码</button>
        <span role="status">{result.code === code ? result.message : ''}</span>
      </div>
      <pre role="region" tabIndex={0} aria-label="可复制的完整示例代码"><code data-testid="playground-code">{code}</code></pre>
    </div>
  );
}
