import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type SkeletonVariant = 'text' | 'rectangle' | 'circle';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangle', ...props }, ref) => (
    <div
      className={cn('oxygen-skeleton', `oxygen-skeleton--${variant}`, className)}
      data-variant={variant}
      ref={ref}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';
