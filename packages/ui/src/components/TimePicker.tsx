import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export interface TimePickerProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'onChange' | 'type' | 'value'
  > {
  defaultValue?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, onChange, ...props }, ref) => (
    <input
      className={cn('oxygen-time-picker', className)}
      data-oxygen-control="true"
      onChange={(event) => onChange?.(event.currentTarget.value)}
      ref={ref}
      type="time"
      {...props}
    />
  ),
);

TimePicker.displayName = 'TimePicker';
