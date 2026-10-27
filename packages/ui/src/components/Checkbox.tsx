import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { forwardRef } from 'react';

import { Check } from '../Icons';
import { cn } from '../lib/cn';

export type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
>;

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    className={cn('oxygen-checkbox', className)}
    data-oxygen-control="true"
    ref={ref}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="oxygen-checkbox__indicator">
      <Check aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
