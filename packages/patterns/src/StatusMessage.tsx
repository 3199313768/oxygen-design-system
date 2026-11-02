import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  type AlertTone,
} from '@oxygen-design/ui';

export interface StatusMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  action?: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  tone?: AlertTone;
}

export const StatusMessage = forwardRef<HTMLDivElement, StatusMessageProps>(function StatusMessage({
  action,
  children,
  className,
  title,
  tone = 'info',
  ...props
}, ref) {
  return (
    <Alert {...props} className={['oxygen-status-message', className].filter(Boolean).join(' ')} ref={ref} tone={tone}>
      <div className="oxygen-status-message__copy">
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        <AlertDescription>{children}</AlertDescription>
      </div>
      {action ? <div className="oxygen-status-message__action">{action}</div> : null}
    </Alert>
  );
});
