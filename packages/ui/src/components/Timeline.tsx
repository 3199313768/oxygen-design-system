import { forwardRef, type HTMLAttributes, type Key, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export type TimelineStatus = 'default' | 'success' | 'warning' | 'error' | 'pending';

export interface TimelineItem {
  key: Key;
  children: ReactNode;
  label?: ReactNode;
  dot?: ReactNode;
  status?: TimelineStatus;
}

export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items?: TimelineItem[];
  loading?: boolean;
  loadingText?: ReactNode;
  emptyText?: ReactNode;
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, emptyText, items = [], loading = false, loadingText, ...props }, ref) => {
    const locale = useOxygenLocale();

    return (
      <ol aria-busy={loading || undefined} className={cn('oxygen-timeline', className)} ref={ref} {...props}>
        {loading ? <li><span role="status">{loadingText ?? locale.common.loading}</span></li> : items.length === 0 ? (
          <li className="oxygen-display-empty">{emptyText ?? locale.common.empty}</li>
        ) : items.map(({ children, dot, key, label, status = 'default' }) => (
          <li className="oxygen-timeline__item" data-status={status} key={key}>
            <span aria-hidden="true" className="oxygen-timeline__dot">{dot ?? (status === 'success' ? '✓' : status === 'error' ? '×' : status === 'warning' ? '!' : status === 'pending' ? '…' : '•')}</span>
            <div className="oxygen-timeline__content">
              {label != null ? <div className="oxygen-timeline__label">{label}</div> : null}
              <span className="oxygen-display-sr-only">{locale.timeline[status]}</span>
              <div>{children}</div>
            </div>
          </li>
        ))}
      </ol>
    );
  },
);
Timeline.displayName = 'Timeline';
