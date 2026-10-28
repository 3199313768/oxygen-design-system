import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type Key, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export interface DescriptionsItem {
  key: Key;
  label: ReactNode;
  children: ReactNode;
  span?: number;
}

export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  title?: ReactNode;
  items?: DescriptionsItem[];
  /** Number of columns on wide containers; narrow containers use one column. */
  column?: 1 | 2 | 3 | 4;
  bordered?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
  emptyText?: ReactNode;
  error?: ReactNode;
}

export const Descriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
  ({ bordered = false, className, column = 3, emptyText, error, items = [], loading = false, loadingText, style, title, ...props }, ref) => {
    const locale = useOxygenLocale();
    const titleId = useId();

    return (
      <div
        aria-busy={loading || undefined}
        className={cn('oxygen-descriptions', className)}
        data-bordered={bordered || undefined}
        ref={ref}
        style={{ ...style, '--oxygen-descriptions-columns': column } as CSSProperties}
        {...props}
      >
        {title != null ? <h3 className="oxygen-descriptions__title" id={titleId}>{title}</h3> : null}
        {loading ? <div role="status">{loadingText ?? locale.common.loading}</div> : error != null ? (
          <div role="alert">{error}</div>
        ) : items.length === 0 ? <div className="oxygen-display-empty">{emptyText ?? locale.common.empty}</div> : (
          <dl aria-labelledby={title != null ? titleId : undefined} className="oxygen-descriptions__list">
            {items.map((item) => (
              <div className="oxygen-descriptions__item" key={item.key} style={{ '--oxygen-descriptions-span': Math.min(column, Math.max(1, Math.floor(item.span || 1))) } as CSSProperties}>
                <dt className="oxygen-descriptions__label">{item.label}</dt>
                <dd className="oxygen-descriptions__value">{item.children}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    );
  },
);
Descriptions.displayName = 'Descriptions';
