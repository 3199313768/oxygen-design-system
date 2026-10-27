import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef } from 'react';

import { cn } from '../lib/cn';

export type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

export const Label = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    className={cn('oxygen-label', className)}
    ref={ref}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;
