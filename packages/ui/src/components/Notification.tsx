import { forwardRef, type ReactNode } from 'react';

import { useOxygenLocale } from './ConfigProvider';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  type ToastProps,
} from './Toast';

export interface NotificationProps extends Omit<ToastProps, 'children' | 'title'> {
  action?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export const Notification = forwardRef<React.ElementRef<typeof Toast>, NotificationProps>(
  ({ action, description, title, ...props }, ref) => {
    const locale = useOxygenLocale();
    return (
      <Toast ref={ref} {...props}>
        <ToastTitle>{title}</ToastTitle>
        {description ? <ToastDescription>{description}</ToastDescription> : null}
        {action}
        <ToastClose aria-label={locale.common.close} />
      </Toast>
    );
  },
);

Notification.displayName = 'Notification';
