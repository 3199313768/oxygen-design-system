import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export interface StatisticTrend {
  direction: 'up' | 'down' | 'neutral';
  /** Include the direction in this text, e.g. "Up 5% from last month". */
  label: ReactNode;
}

export interface StatisticProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title' | 'prefix'> {
  title?: ReactNode;
  value?: string | number | null;
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  trend?: StatisticTrend;
  loading?: boolean;
  loadingText?: ReactNode;
  emptyText?: ReactNode;
  error?: ReactNode;
}

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(
  ({ className, emptyText, error, loading = false, loadingText, precision, prefix, suffix, title, trend, value, ...props }, ref) => {
    const locale = useOxygenLocale();
    const formattedValue = typeof value === 'number' && precision !== undefined
      ? value.toFixed(Number.isFinite(precision) ? Math.min(100, Math.max(0, Math.floor(precision))) : 0)
      : value;

    return (
      <div aria-busy={loading || undefined} className={cn('oxygen-statistic', className)} ref={ref} {...props}>
        {title != null ? <div className="oxygen-statistic__title">{title}</div> : null}
        {loading ? <div role="status">{loadingText ?? locale.common.loading}</div> : error != null ? (
          <div role="alert">{error}</div>
        ) : value == null ? <div className="oxygen-display-empty">{emptyText ?? locale.common.empty}</div> : (
          <>
            <div className="oxygen-statistic__content">
              {prefix != null ? <span className="oxygen-statistic__prefix">{prefix}</span> : null}
              <span className="oxygen-statistic__value">{formattedValue}</span>
              {suffix != null ? <span className="oxygen-statistic__suffix">{suffix}</span> : null}
            </div>
            {trend ? <div className="oxygen-statistic__trend" data-direction={trend.direction}>
              <span aria-hidden="true">{trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}</span>
              <span>{trend.label}</span>
            </div> : null}
          </>
        )}
      </div>
    );
  },
);
Statistic.displayName = 'Statistic';
