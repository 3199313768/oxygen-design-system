import { useEffect, useRef, useState } from 'react';
import {
  Alert, Badge, Button, ConfigProvider, Form, Input, Pagination, Select,
  SelectContent, SelectItem, SelectTrigger, SelectValue, Table,
  type OxygenTheme, type TableColumn,
} from '@oxygen-design/ui';
import { EmptyState, PageHeader } from '@oxygen-design/patterns';
import { RecordEditor, type DemoRecord } from './RecordEditor';
import { ThemeExamples } from './ThemeExamples';
import { FoundationExamples } from './FoundationExamples';

const initialRecords: DemoRecord[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `演示记录 ${String(index + 1).padStart(2, '0')}`,
  status: index % 2 === 0 ? 'enabled' : 'disabled',
  attachments: [],
}));

export function App() {
  const [theme, setTheme] = useState<OxygenTheme>('light');
  useEffect(() => {
    const previous = document.documentElement.getAttribute('data-oxygen-theme');
    document.documentElement.setAttribute('data-oxygen-theme', theme);
    return () => {
      if (previous === null) document.documentElement.removeAttribute('data-oxygen-theme');
      else document.documentElement.setAttribute('data-oxygen-theme', previous);
    };
  }, [theme]);
  const [records, setRecords] = useState(initialRecords);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [filter, setFilter] = useState({ keyword: '', status: 'all' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [editing, setEditing] = useState<DemoRecord | null>(null);
  const [notice, setNotice] = useState('');
  const editTrigger = useRef<HTMLButtonElement | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const filtered = records.filter((record) =>
    record.name.toLowerCase().includes(filter.keyword.toLowerCase()) &&
    (filter.status === 'all' || record.status === filter.status),
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function reset() {
    setKeyword('');
    setStatus('all');
    setFilter({ keyword: '', status: 'all' });
    setPage(1);
  }

  const columns: TableColumn<DemoRecord>[] = [
    { key: 'name', dataIndex: 'name', title: '名称', width: '40%' },
    { key: 'status', title: '状态', render: (_value, record) =>
      <Badge variant={record.status === 'enabled' ? 'success' : 'secondary'}>
        {record.status === 'enabled' ? '启用中' : '已停用'}
      </Badge> },
    { key: 'attachments', title: '附件', render: (_value, record) =>
      record.attachments.map((file) => file.name).join('、') || '—' },
    { key: 'actions', title: '操作', render: (_value, record) =>
      <Button variant="link" aria-label={`编辑 ${record.name}`} onClick={(event) => {
        editTrigger.current = event.currentTarget;
        setNotice('');
        setEditing(record);
      }}>编辑</Button> },
  ];

  return (
    <ConfigProvider theme={theme}>
      <main className="workbench">
        <label className="workbench-theme-picker">
          页面主题
          <select value={theme} onChange={(event) => setTheme(event.target.value as OxygenTheme)}>
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="system">跟随系统</option>
          </select>
        </label>
        <PageHeader title="记录管理" description="查询、编辑和附件管理的完整页面示例。演示数据仅在本次页面会话中保留。" />
        <section className="workbench-panel" aria-label="筛选记录">
          <Form className="workbench-filters" onSubmit={(event) => {
            event.preventDefault();
            setFilter({ keyword: keyword.trim(), status });
            setPage(1);
          }}>
            <Form.Item label="关键词" name="keyword">
              <Input ref={searchInput} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="按名称搜索" />
            </Form.Item>
            <Form.Item label="状态筛选" name="status-filter">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="enabled">启用中</SelectItem>
                  <SelectItem value="disabled">已停用</SelectItem>
                </SelectContent>
              </Select>
            </Form.Item>
            <div className="workbench-actions">
              <Button type="submit">查询</Button>
              <Button type="button" variant="secondary" onClick={reset}>重置</Button>
            </div>
          </Form>
        </section>
        {notice ? <Alert tone="success">{notice}</Alert> : null}
        <section className="workbench-panel workbench-results" aria-labelledby="results-title">
          <div className="workbench-result-heading">
            <h2 id="results-title">记录列表</h2>
            <span aria-live="polite">共 {filtered.length} 条记录</span>
          </div>
          <div className="workbench-table-region" role="region" aria-label="记录表格滚动区域" tabIndex={0}>
            <Table aria-label="记录列表" columns={columns} dataSource={visible} rowKey="id"
              emptyText={<EmptyState title="没有匹配记录" description="尝试其他关键词或清除筛选。"
                action={<Button variant="secondary" onClick={reset}>清除筛选</Button>} />} />
          </div>
          <Pagination current={currentPage} pageSize={pageSize} pageSizeOptions={[5, 10]}
            total={filtered.length} showSizeChanger showTotal onChange={(next, size) => {
              setPage(next);
              setPageSize(size);
            }} />
        </section>
        <ThemeExamples theme={theme === 'dark' ? 'light' : 'dark'} />
        <FoundationExamples />
      </main>
      {editing ? <RecordEditor key={editing.id} record={editing} onClose={() => setEditing(null)}
        restoreFocus={() => {
          if (editTrigger.current?.isConnected) editTrigger.current.focus();
          else searchInput.current?.focus();
        }}
        onSave={(record) => {
          setRecords((current) => current.map((item) => item.id === record.id ? record : item));
          setEditing(null);
          setNotice('记录已保存');
        }} /> : null}
    </ConfigProvider>
  );
}
