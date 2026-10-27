import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type FieldProps = HTMLAttributes<HTMLDivElement>;

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ className, ...props }, ref) => (
    <div className={cn('oxygen-field', className)} ref={ref} {...props} />
  ),
);

Field.displayName = 'Field';

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>;

export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ children, className, ...props }, ref) => {
    if (!children) return null;

    return (
      <p
        className={cn('oxygen-field-error', className)}
        ref={ref}
        role="alert"
        {...props}
      >
        {children}
      </p>
    );
  },
);

FieldError.displayName = 'FieldError';
