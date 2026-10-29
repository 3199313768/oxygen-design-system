import { forwardRef, type HTMLAttributes } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export type ProgressStatus = 'active' | 'exception' | 'normal' | 'success';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  percent?: number;
  showInfo?: boolean;
  status?: ProgressStatus;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, className, percent = 0, showInfo = true, status = 'normal', ...props }, ref) => {
    const locale = useOxygenLocale();
    const normalizedPercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const statusText = status === 'exception' ? locale.steps.error : status === 'success' ? locale.steps.finish : status === 'active' ? locale.steps.process : undefined;
    return (
      <div
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : locale.common.progress ?? '进度')}
        aria-labelledby={ariaLabelledBy}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedPercent}
        aria-valuetext={statusText ? `${statusText} ${normalizedPercent}%` : undefined}
        className={cn('oxygen-progress', className)}
        data-status={status}
        ref={ref}
        role="progressbar"
        {...props}
      >
        <span className="oxygen-progress__track">
          <span className="oxygen-progress__bar" style={{ width: `${normalizedPercent}%` }} />
        </span>
        {showInfo ? (
          <span className="oxygen-progress__info">
            {status === 'exception' ? <CircleX aria-hidden="true" /> : status === 'success' ? <CircleCheck aria-hidden="true" /> : null}
            {normalizedPercent}%
          </span>
        ) : null}
      </div>
    );
  },
);

Progress.displayName = 'Progress';
