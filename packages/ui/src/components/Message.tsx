import { forwardRef, type ReactNode } from 'react';

import { useOxygenLocale } from './ConfigProvider';
import { Toast, ToastClose, ToastDescription, type ToastProps } from './Toast';

export interface MessageProps extends Omit<ToastProps, 'children'> {
  children: ReactNode;
}

export const Message = forwardRef<React.ElementRef<typeof Toast>, MessageProps>(
  ({ children, ...props }, ref) => {
    const locale = useOxygenLocale();
    return (
      <Toast ref={ref} {...props}>
        <ToastDescription>{children}</ToastDescription>
        <ToastClose aria-label={locale.common.close} />
      </Toast>
    );
  },
);

Message.displayName = 'Message';
