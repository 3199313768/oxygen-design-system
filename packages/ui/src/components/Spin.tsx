import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export interface SpinProps extends HTMLAttributes<HTMLDivElement> {
  spinning?: boolean;
  tip?: ReactNode;
}

export const Spin = forwardRef<HTMLDivElement, SpinProps>(
  ({ children, className, spinning = true, tip, ...props }, ref) => {
    const locale = useOxygenLocale();
    const resolvedTip = tip ?? locale.common.loading;

    return (
      <div
        aria-busy={spinning || undefined}
        className={cn('oxygen-spin', className)}
        data-spinning={spinning ? 'true' : 'false'}
        ref={ref}
        {...props}
      >
        {spinning ? (
          <span
            aria-label={typeof resolvedTip === 'string' ? resolvedTip : locale.common.loading}
            className="oxygen-spin__indicator"
            role="status"
          >
            <span aria-hidden="true" className="oxygen-spin__dot" />
            {resolvedTip}
          </span>
        ) : null}
        {children}
      </div>
    );
  },
);

Spin.displayName = 'Spin';
