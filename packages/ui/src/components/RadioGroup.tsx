import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Slottable } from '@radix-ui/react-slot';
import { forwardRef } from 'react';

import { cn } from '../lib/cn';

export type RadioGroupProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
>;

export const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn('oxygen-radio-group', className)}
    ref={ref}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
>;

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ children, className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    className={cn('oxygen-radio-group__item', className)}
    data-oxygen-control="true"
    ref={ref}
    {...props}
  >
    <Slottable>{children}</Slottable>
    <RadioGroupPrimitive.Indicator className="oxygen-radio-group__indicator">
      <span aria-hidden="true" className="oxygen-radio-group__dot" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export const RadioGroupIndicator = RadioGroupPrimitive.Indicator;
