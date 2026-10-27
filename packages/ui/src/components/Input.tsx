import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      className={cn('oxygen-input', className)}
      data-oxygen-control="true"
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
