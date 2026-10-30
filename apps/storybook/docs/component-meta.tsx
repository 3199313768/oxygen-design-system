import type { ComponentType } from 'react';
import type { ArgTypes } from '@storybook/react-vite';
import { useArgs, useState } from 'storybook/preview-api';
import playgrounds from './playgrounds.json';
import { componentDocs } from './content';
import { CodeSample } from './CodeSample';
import { ComponentDocsPage } from './ComponentDocs';
import { exampleSource } from './source-code.mjs';

export type ComponentName = keyof typeof playgrounds;

export function componentMeta<T extends Record<string, unknown>>(name: ComponentName, Example: ComponentType<T>, source: string) {
  const definition = playgrounds[name];
  const doc = componentDocs.find((entry) => entry.name === name);
  const argTypes = Object.fromEntries(Object.entries(definition.argTypes).map(([key, control]) => [key, { ...control, description: doc?.propNotes[key]?.description ?? '示例参数；映射到组件或子组件的具体写法见完整代码。', table: { category: '示例参数' } }]));
  return {
    component: Example,
    args: definition.args as unknown as T,
    argTypes: argTypes as ArgTypes<T>,
    parameters: { componentDocName: name, docs: { page: ComponentDocsPage, canvas: { sourceState: 'none' }, source: { code: exampleSource(source, definition.args) } } },
    render: function Render(args: T) {
      const [, , resetArgs] = useArgs<T>();
      // Storybook hooks isolate each embedded story; React hooks share the docs renderer.
      const [revision, setRevision] = useState(0);
      return <section data-testid="playground" className="oxygen-docs-playground">
        <div className="oxygen-docs-preview"><Example key={revision} {...args} /></div>
        <button type="button" onClick={() => { resetArgs(); setRevision((value) => value + 1); }}>恢复默认</button>
        <CodeSample code={exampleSource(source, args)} />
      </section>;
    },
  };
}
