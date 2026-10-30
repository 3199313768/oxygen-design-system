import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { X } from '../Icons';
import { cn } from '../lib/cn';
import { useOxygenThemeAttributes } from './theme-context';
import { useOxygenLocale } from './ConfigProvider';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

export const SheetOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  return (
    <DialogPrimitive.Overlay
      {...themeAttributes}
      className={cn('oxygen-overlay', className)}
      ref={ref}
      {...props}
    />
  );
});
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva('oxygen-sheet', {
  defaultVariants: { side: 'right' },
  variants: {
    side: {
      bottom: 'oxygen-sheet--bottom',
      left: 'oxygen-sheet--left',
      right: 'oxygen-sheet--right',
      top: 'oxygen-sheet--top',
    },
  },
});

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  closeLabel?: string;
}

export const SheetContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ children, className, closeLabel, side, ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  const { common } = useOxygenLocale();
  const accessibleCloseLabel = closeLabel || common.close;

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        {...themeAttributes}
        className={cn(sheetVariants({ side }), className)}
        ref={ref}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={accessibleCloseLabel}
          className="oxygen-sheet__close"
          data-oxygen-control="true"
          data-oxygen-icon-button="true"
        >
          <X aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

export const SheetHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('oxygen-dialog__header', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

export const SheetFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('oxygen-dialog__footer', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

export const SheetTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn('oxygen-dialog__title', className)}
    ref={ref}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export const SheetDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn('oxygen-dialog__description', className)}
    ref={ref}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
