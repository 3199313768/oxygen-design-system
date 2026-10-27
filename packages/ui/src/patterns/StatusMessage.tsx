import type { ReactNode } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  type AlertTone,
} from '../components/Alert';

export interface StatusMessageProps {
  action?: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  tone?: AlertTone;
}

export function StatusMessage({
  action,
  children,
  title,
  tone = 'info',
}: StatusMessageProps) {
  return (
    <Alert className="oxygen-status-message" tone={tone}>
      <div className="oxygen-status-message__copy">
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        <AlertDescription>{children}</AlertDescription>
      </div>
      {action ? <div className="oxygen-status-message__action">{action}</div> : null}
    </Alert>
  );
}
