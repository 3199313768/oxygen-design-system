import { useState } from 'react';
import { Controls, Primary, Stories, useOf } from '@storybook/addon-docs/blocks';
import data from './api.generated.json';
import { componentDocs } from './content';
import type { ComponentDoc } from './types';

type Property = (typeof data.properties)[number];
const sectionTitles = ['组件介绍', '设计规范', 'API 参数', '基础示例', '不同状态', '交互示例', '使用限制', '可访问性说明'];
const common = new Set(['children', 'className', 'style', 'id', 'title', 'disabled', 'value', 'defaultValue', 'onChange', 'onClick', 'required', 'readOnly', 'placeholder', 'type', 'name', 'size', 'variant', 'min', 'max', 'step', 'rows', 'aria-label', 'aria-describedby', 'aria-invalid']);
const explanations: Record<string, string> = {
  children: '组件内容；组合式组件按示例嵌套对应子组件。',
  className: '附加 CSS 类名；保留组件内置样式。', style: '附加内联样式，优先复用 Oxygen 语义 Token。',
  id: 'DOM 标识，可用于标签与帮助信息关联。', title: '标题或原生提示，语义以组件类型为准。',
  value: '受控值；与对应变更回调一起使用，由宿主更新。', defaultValue: '非受控初始值，仅在初始化时使用。',
  open: '受控展开状态，需处理 onOpenChange。', defaultOpen: '非受控初始展开状态。',
  disabled: '禁用交互；不代表完成权限校验。', required: '必填标记或原生必填约束，业务校验由宿主处理。',
  readOnly: '只读，用户不能编辑，具体原生行为由控件决定。', placeholder: '无值时的提示；不能代替可访问标签。',
  onChange: '值变化回调；回调参数的类型以本行签名为准。', onClick: '点击事件；异步请求与重复提交由调用方处理。',
  onOpenChange: '展开/关闭变化回调，受控时更新 open。', onValueChange: '值变化回调，受控时更新 value。',
  onCheckedChange: '勾选变化回调，注意不确定状态可能为 indeterminate。',
  'aria-label': '可访问名称；无可见标签时必须提供有意义的名称。',
  'aria-describedby': '指向帮助或错误文本的元素 ID。', 'aria-invalid': '表达校验失败；同时提供可理解的错误文本。',
  min: '最小值或范围下界，具体类型见本行。', max: '最大值或范围上界，具体类型见本行。', step: '数值调整步长。',
  rows: '多行文本的初始可见行数。', name: '原生字段名或组件标识；不等同自动注册业务表单。',
  asChild: '将行为合并到单一子元素；子元素必须接收属性和 ref，不能嵌套交互元素。',
};

function noteFor(doc: ComponentDoc, exported: string, prop: Property) {
  return doc.propNotes[`${exported}.${prop.name}`] ?? doc.propNotes[prop.name];
}

function PropertyTable({ props, doc, exported }: { props: Property[]; doc: ComponentDoc; exported: string }) {
  return <div className="oxygen-docs-table" role="region" aria-label={`${exported} 参数表`} tabIndex={0}>
    <table><caption>{exported} API</caption><thead><tr><th scope="col">参数</th><th scope="col">类型</th><th scope="col">必填</th><th scope="col">默认值</th><th scope="col">说明</th></tr></thead>
      <tbody>{props.map((prop) => {
        const note = noteFor(doc, exported, prop);
        return <tr key={prop.name}><th scope="row"><code>{prop.name}</code></th><td><code>{prop.type}</code></td><td>{prop.required ? '是' : '否'}</td><td><code>{note?.default ?? prop.defaultValue}</code></td><td>{note?.description || prop.description || explanations[prop.name] || (prop.name.startsWith('on') ? `交互回调；参数与返回值见类型签名。` : prop.inherited ? '继承 React、Radix 或底层库的同名属性，按类型使用。' : '组件公开属性；与当前页面示例和数据类型配合使用。')}</td></tr>;
      })}</tbody>
    </table>
  </div>;
}

function ExportApi({ entry, doc }: { entry: (typeof data.families)[number]['exports'][number]; doc: ComponentDoc }) {
  const [expanded, setExpanded] = useState(false);
  const props = entry.props.map((index) => data.properties[index]);
  const primary = props.filter((prop) => !prop.inherited || common.has(prop.name) || Boolean(noteFor(doc, entry.name, prop)));
  const inherited = props.filter((prop) => !primary.includes(prop));
  return <div className="oxygen-docs-export"><h3>{entry.name}</h3>
    {primary.length ? <PropertyTable props={primary} doc={doc} exported={entry.name} /> : <p>此导出没有独立参数；按组合结构使用。</p>}
    {inherited.length > 0 && <details onToggle={(event) => setExpanded(event.currentTarget.open)}><summary>继承属性与事件（{inherited.length}）</summary>{expanded && <PropertyTable props={inherited} doc={doc} exported={entry.name} />}</details>}
  </div>;
}

function Api({ doc }: { doc: ComponentDoc }) {
  const alias = doc.name === 'FormItem' ? 'Form' : doc.name === 'SpaceCompact' ? 'Space' : doc.name;
  const family = data.families.find((candidate) => candidate.name === alias);
  if (!family) return <p role="alert">缺少 {doc.name} 的源码 API 数据，请运行文档生成命令。</p>;
  let exports = family.exports;
  if (doc.name === 'FormItem') exports = exports.filter((entry) => entry.name === 'FormItem');
  if (doc.name === 'SpaceCompact') exports = exports.filter((entry) => entry.name === 'SpaceCompact');
  return <>
    <p>类型来自当前源码；“—”表示没有在实现中声明该参数的默认值。原生及底层库的运行时行为遵循继承契约。下面包括复合子组件、继承属性和公开数据类型。Playground 只开放适合直接编辑的参数。</p>
    {exports.map((entry) => <ExportApi key={entry.name} entry={entry} doc={doc} />)}
    {family.types.length > 0 && <details><summary>公开类型与组合成员（{family.types.length}）</summary>{family.types.map((type) => <div key={type.name}><h3>{type.name}</h3><pre role="region" tabIndex={0} aria-label={`${type.name} 类型定义`}><code>{type.declaration}</code></pre></div>)}</details>}
  </>;
}

function Notes({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function ComponentDocs({ name }: { name: string }) {
  const doc = componentDocs.find((candidate) => candidate.name === name);
  if (!doc) return <p role="alert">缺少组件文档：{name}</p>;
  return <article className="oxygen-component-docs">
    <header><p className="oxygen-docs-eyebrow">Oxygen · {doc.category}</p><h1>{doc.name} {doc.title}</h1><p>{doc.description}</p></header>
    <nav aria-label="本页目录"><ol>{sectionTitles.map((title, index) => <li key={title}><a href={`#component-section-${index + 1}`}>{title}</a></li>)}</ol></nav>
    <section id="component-section-1"><h2>组件介绍</h2><p>{doc.description}</p></section>
    <section id="component-section-2"><h2>设计规范</h2><Notes items={doc.design} /><p>同时遵循 <a href="./?path=/docs/基础规范-设计与可访问性--docs">设计与可访问性基础规范</a>。样式通过 <code>--oxygen-color-*</code>、<code>--oxygen-space-*</code>、<code>--oxygen-radius-*</code> 等现有语义 Token 调整；具体可用变量以已安装版本的 tokens.css 为准。</p></section>
    <section id="component-section-3"><h2>API 参数</h2><Api doc={doc} /></section>
    <section id="component-section-4"><h2>基础示例</h2><p>在下方 Controls 调整 Props，预览与完整代码同步更新。“恢复默认”同时重置参数和示例内部状态。复杂数据、函数与 ReactNode 的写法见代码和 API。</p><Primary /><div className="oxygen-docs-controls" role="region" tabIndex={0} aria-label="Props 调试参数表"><Controls /></div></section>
    <section id="component-section-5"><h2>不同状态</h2><p>{doc.stateNotes}</p><Stories includePrimary={false} /></section>
    <section id="component-section-6"><h2>交互示例</h2><p>{doc.interaction}</p><p>基础示例及上方状态示例均可操作；使用 Tab 移动焦点，并按组件说明操作。静态组件通过 Props 调整内容或布局。</p></section>
    <section id="component-section-7"><h2>使用限制</h2><Notes items={doc.restrictions} /></section>
    <section id="component-section-8"><h2>可访问性说明</h2><Notes items={doc.accessibility} /><p>自动检查不能代替真实键盘与读屏器验收；完整产品仍需验证组合后的标签、对比度和焦点顺序。</p></section>
  </article>;
}

export function ComponentDocsPage() {
  const resolved = useOf('meta');
  const name = resolved.type === 'meta' ? resolved.preparedMeta.parameters.componentDocName as string | undefined : undefined;
  return name ? <ComponentDocs name={name} /> : null;
}
