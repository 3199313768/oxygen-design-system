import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type DividerType = 'horizontal' | 'vertical';
export type DividerOrientation = 'left' | 'center' | 'right';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  type?: DividerType;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ children, className, orientation = 'center', type = 'horizontal', ...props }, ref) => (
    <div
      aria-orientation={type}
      className={cn('oxygen-divider', className)}
      data-orientation={orientation}
      data-type={type}
      role="separator"
      ref={ref}
      {...props}
    >
      {children ? <span className="oxygen-divider__content">{children}</span> : null}
    </div>
  ),
);
Divider.displayName = 'Divider';
