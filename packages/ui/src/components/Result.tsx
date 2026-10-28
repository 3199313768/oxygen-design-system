import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';

import { cn } from '../lib/cn';

export type ResultStatus = '403' | '404' | '500' | 'error' | 'info' | 'success' | 'warning';

export interface ResultProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  extra?: ReactNode;
  status?: ResultStatus;
  subTitle?: ReactNode;
  title: ReactNode;
}

export const Result = forwardRef<HTMLElement, ResultProps>(
  ({ className, extra, status = 'info', subTitle, title, ...props }, ref) => (
    <section
      className={cn('oxygen-result', className)}
      data-status={status}
      ref={ref}
      {...props}
    >
      <div aria-hidden="true" className="oxygen-result__icon">{status === 'success' ? <CircleCheck /> : status === 'error' ? <CircleX /> : status === 'warning' ? <TriangleAlert /> : status === 'info' ? <Info /> : status}</div>
      <h2 className="oxygen-result__title">{title}</h2>
      {subTitle ? <p className="oxygen-result__subtitle">{subTitle}</p> : null}
      {extra ? <div className="oxygen-result__extra">{extra}</div> : null}
    </section>
  ),
);

Result.displayName = 'Result';
