import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Slottable } from '@radix-ui/react-slot';
import { Check, Minus } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { cn } from '../lib/cn';

export type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
>;

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ children, className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const state = checked ?? internalChecked;
  return (
    <CheckboxPrimitive.Root
      className={cn('oxygen-checkbox', className)}
      data-oxygen-control="true"
      ref={ref}
      checked={state}
      onCheckedChange={(next) => { setInternalChecked(next); onCheckedChange?.(next); }}
      {...props}
    >
      <Slottable>{children}</Slottable>
      <CheckboxPrimitive.Indicator className="oxygen-checkbox__indicator">
        {state === 'indeterminate' ? <Minus aria-hidden="true" size={14} /> : <Check aria-hidden="true" size={14} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
