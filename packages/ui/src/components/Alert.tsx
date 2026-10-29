import { forwardRef, type HTMLAttributes } from 'react';
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';

import { cn } from '../lib/cn';

export type AlertTone = 'error' | 'info' | 'success' | 'warning';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  showIcon?: boolean;
  tone?: AlertTone;
}

const toneIcons = { error: CircleX, info: Info, success: CircleCheck, warning: TriangleAlert };

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ children, className, role, showIcon = true, tone = 'info', ...props }, ref) => {
    const Icon = toneIcons[tone];
    return (
      <div
        className={cn('oxygen-alert', className)}
        data-tone={tone}
        data-show-icon={showIcon ? 'true' : 'false'}
        ref={ref}
        role={role ?? (tone === 'error' ? 'alert' : 'status')}
        {...props}
      >
        {showIcon ? <Icon aria-hidden="true" className="oxygen-alert__icon" /> : null}
        <div className="oxygen-alert__content">{children}</div>
      </div>
    );
  },
);
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 className={cn('oxygen-alert__title', className)} ref={ref} {...props} />
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn('oxygen-alert__description', className)}
    ref={ref}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';
