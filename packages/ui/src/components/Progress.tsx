import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type ProgressStatus = 'active' | 'exception' | 'normal' | 'success';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  percent?: number;
  showInfo?: boolean;
  status?: ProgressStatus;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, percent = 0, showInfo = true, status = 'normal', ...props }, ref) => {
    const normalizedPercent = Math.min(100, Math.max(0, percent));
    return (
      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedPercent}
        className={cn('oxygen-progress', className)}
        data-status={status}
        ref={ref}
        role="progressbar"
        {...props}
      >
        <span className="oxygen-progress__track">
          <span className="oxygen-progress__bar" style={{ width: `${normalizedPercent}%` }} />
        </span>
        {showInfo ? <span className="oxygen-progress__info">{normalizedPercent}%</span> : null}
      </div>
    );
  },
);

Progress.displayName = 'Progress';
