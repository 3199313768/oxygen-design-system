import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';

import { cn } from '../lib/cn';
import { useOxygenThemeAttributes } from './theme-context';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;
export const PopoverPortal = PopoverPrimitive.Portal;
export const PopoverArrow = PopoverPrimitive.Arrow;

export type PopoverContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
>;

export const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ align = 'center', className, sideOffset = 8, ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  return (
    <PopoverPortal>
      <PopoverPrimitive.Content
        {...themeAttributes}
        align={align}
        className={cn('oxygen-popover', className)}
        ref={ref}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPortal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
