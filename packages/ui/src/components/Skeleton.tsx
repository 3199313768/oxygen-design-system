import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type SkeletonVariant = 'text' | 'rectangle' | 'circle';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, className, role, variant = 'rectangle', ...props }, ref) => (
    <div
      aria-hidden={!ariaLabel && !ariaLabelledBy && !role ? true : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn('oxygen-skeleton', `oxygen-skeleton--${variant}`, className)}
      data-variant={variant}
      ref={ref}
      role={role ?? (ariaLabel || ariaLabelledBy ? 'img' : undefined)}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';
