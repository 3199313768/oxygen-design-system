import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
} from 'react';
import type { PropsBase } from 'react-day-picker';

export interface OxygenLocale {
  colorPicker?: { label: string; invalid: string; nativePicker: string; cancel: string; confirm: string };
  upload?: { dragHint?: string; pending: string; uploading: string; done: string; error: string };
  transfer?: { toTarget: string; toSource: string };
  steps: {
    wait: string;
    process: string;
    finish: string;
    error: string;
  };
  timeline: {
    default: string;
    success: string;
    warning: string;
    error: string;
    pending: string;
  };
  calendar: {
    locale?: PropsBase['locale'];
    labels?: PropsBase['labels'];
  };
  common: {
    breadcrumb: string;
    browse: string;
    clear: string;
    close: string;
    collapse: string;
    empty: string;
    expand: string;
    loading: string;
    next: string;
    noOptions: string;
    page: (page: number) => string;
    pageSizeOption: (pageSize: number) => string;
    pagination: string;
    remove: string;
    search: string;
    selectAll: string;
    selectRow: (row: number) => string;
    total: (total: number) => string;
    previous: string;
    progress?: string;
    pageSize: string;
    selected: string;
    upload: string;
  };
}

type ResolvedOxygenLocale = OxygenLocale & Required<Pick<OxygenLocale, 'colorPicker' | 'upload' | 'transfer'>>;

export const defaultLocale: ResolvedOxygenLocale = {
  colorPicker: { label: '颜色', invalid: '请输入有效的六位十六进制颜色，例如 #1677FF', nativePicker: '颜色选择器', cancel: '取消', confirm: '确定' },
  upload: { dragHint: '点击或拖拽文件到此处上传', pending: '待上传', uploading: '上传中', done: '已完成', error: '上传失败' },
  transfer: { toTarget: '移至目标列表', toSource: '移至源列表' },
  steps: { wait: '等待中', process: '进行中', finish: '已完成', error: '错误' },
  timeline: { default: '记录', success: '成功', warning: '警告', error: '错误', pending: '进行中' },
  calendar: {},
  common: {
    breadcrumb: '面包屑',
    browse: '浏览',
    clear: '清除',
    close: '关闭',
    collapse: '收起',
    empty: '暂无数据',
    expand: '展开',
    loading: '加载中',
    next: '下一页',
    noOptions: '暂无选项',
    page: (page) => `第 ${page} 页`,
    pageSizeOption: (pageSize) => `${pageSize} / 页`,
    pagination: '分页',
    remove: '移除',
    search: '搜索',
    selectAll: '选择全部',
    selectRow: (row) => `选择第 ${row} 行`,
    total: (total) => `共 ${total} 条`,
    previous: '上一页',
    progress: '进度',
    pageSize: '每页条数',
    selected: '已选择',
    upload: '上传',
  },
};

export type OxygenLocaleConfig = {
  colorPicker?: Partial<NonNullable<OxygenLocale['colorPicker']>>;
  upload?: Partial<NonNullable<OxygenLocale['upload']>>;
  transfer?: Partial<NonNullable<OxygenLocale['transfer']>>;
  steps?: Partial<OxygenLocale['steps']>;
  timeline?: Partial<OxygenLocale['timeline']>;
  calendar?: OxygenLocale['calendar'];
  common?: Partial<OxygenLocale['common']>;
};

export interface ConfigProviderProps {
  children: ReactNode;
  density?: 'default' | 'compact';
  locale?: OxygenLocaleConfig;
}

const LocaleContext = createContext<ResolvedOxygenLocale>(defaultLocale);

export function ConfigProvider({ children, density = 'default', locale }: ConfigProviderProps) {
  const resolvedLocale = useMemo<ResolvedOxygenLocale>(
    () => ({
      ...defaultLocale,
      ...locale,
      colorPicker: { ...defaultLocale.colorPicker, ...locale?.colorPicker },
      upload: { ...defaultLocale.upload, ...locale?.upload },
      transfer: { ...defaultLocale.transfer, ...locale?.transfer },
      calendar: { ...defaultLocale.calendar, ...locale?.calendar },
      steps: { ...defaultLocale.steps, ...locale?.steps },
      timeline: { ...defaultLocale.timeline, ...locale?.timeline },
      common: {
        ...defaultLocale.common,
        ...locale?.common,
      },
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={resolvedLocale}>
      <div data-oxygen-density={density} style={{ display: 'contents' }}>{children}</div>
    </LocaleContext.Provider>
  );
}

export function useOxygenLocale() {
  return useContext(LocaleContext);
}
