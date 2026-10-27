import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type AlertTone = 'error' | 'info' | 'success' | 'warning';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, role, tone = 'info', ...props }, ref) => (
    <div
      className={cn('oxygen-alert', className)}
      data-tone={tone}
      ref={ref}
      role={role ?? (tone === 'error' ? 'alert' : 'status')}
      {...props}
    />
  ),
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
