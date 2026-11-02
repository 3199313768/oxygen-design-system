import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Slottable } from '@radix-ui/react-slot';
import { forwardRef } from 'react';

import { cn } from '../lib/cn';

export type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
>;

export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ children, className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn('oxygen-switch', className)}
    data-oxygen-control="true"
    ref={ref}
    {...props}
  >
    <Slottable>{children}</Slottable>
    <SwitchPrimitive.Thumb className="oxygen-switch__thumb" />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
