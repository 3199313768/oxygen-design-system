import { Check, X } from 'lucide-react';
import { forwardRef, type HTMLAttributes, type Key, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export type StepsStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepsItem {
  key: Key;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: StepsStatus;
}

export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items?: StepsItem[];
  /** Zero-based current step; -1 leaves every step waiting. */
  current?: number;
  status?: StepsStatus;
  direction?: 'horizontal' | 'vertical';
  emptyText?: ReactNode;
}

export const Steps = forwardRef<HTMLOListElement, StepsProps>(
  ({ className, current = 0, direction = 'horizontal', emptyText, items = [], status = 'process', ...props }, ref) => {
    const locale = useOxygenLocale();

    return (
      <ol className={cn('oxygen-steps', className)} data-direction={direction} ref={ref} {...props}>
        {items.length === 0 ? <li className="oxygen-display-empty">{emptyText ?? locale.common.empty}</li> : items.map((item, index) => {
          const itemStatus = item.status ?? (index < current ? 'finish' : index === current ? status : 'wait');
          return (
            <li aria-current={index === current ? 'step' : undefined} className="oxygen-steps__item" data-status={itemStatus} key={item.key}>
              <span aria-hidden="true" className="oxygen-steps__indicator">{item.icon ?? (itemStatus === 'finish' ? <Check size={16} /> : itemStatus === 'error' ? <X size={16} /> : index + 1)}</span>
              <div className="oxygen-steps__content">
                <div className="oxygen-steps__title">{item.title}</div>
                <span className="oxygen-display-sr-only">{locale.steps[itemStatus]}</span>
                {item.description != null ? <div className="oxygen-steps__description">{item.description}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    );
  },
);
Steps.displayName = 'Steps';
