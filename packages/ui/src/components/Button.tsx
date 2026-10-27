import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export const buttonVariants = cva('oxygen-button', {
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
  variants: {
    size: {
      default: 'oxygen-button--default-size',
      icon: 'oxygen-button--icon',
      sm: 'oxygen-button--sm',
    },
    variant: {
      default: 'oxygen-button--default',
      destructive: 'oxygen-button--destructive',
      ghost: 'oxygen-button--ghost',
      link: 'oxygen-button--link',
      secondary: 'oxygen-button--secondary',
    },
  },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        className={cn(buttonVariants({ size, variant }), className)}
        data-oxygen-control="true"
        data-oxygen-icon-button={size === 'icon' ? 'true' : undefined}
        data-size={size ?? 'default'}
        data-variant={variant ?? 'default'}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
