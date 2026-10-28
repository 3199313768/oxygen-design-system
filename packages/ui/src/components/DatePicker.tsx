import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export interface DatePickerProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'onChange' | 'type' | 'value'
  > {
  defaultValue?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, onChange, ...props }, ref) => (
    <input
      className={cn('oxygen-date-picker', className)}
      data-oxygen-control="true"
      onChange={(event) => onChange?.(event.currentTarget.value)}
      ref={ref}
      type="date"
      {...props}
    />
  ),
);

DatePicker.displayName = 'DatePicker';
