import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

const badgeVariants = cva('oxygen-badge', {
  defaultVariants: { variant: 'default' },
  variants: {
    variant: {
      default: 'oxygen-badge--default',
      error: 'oxygen-badge--error',
      outline: 'oxygen-badge--outline',
      secondary: 'oxygen-badge--secondary',
      success: 'oxygen-badge--success',
      warning: 'oxygen-badge--warning',
    },
  },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      className={cn(badgeVariants({ variant }), className)}
      data-variant={variant ?? 'default'}
      ref={ref}
      {...props}
    />
  ),
);

Badge.displayName = 'Badge';
