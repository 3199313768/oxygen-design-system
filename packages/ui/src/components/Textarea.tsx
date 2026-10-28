import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn('oxygen-textarea', className)}
      data-oxygen-control="true"
      ref={ref}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
