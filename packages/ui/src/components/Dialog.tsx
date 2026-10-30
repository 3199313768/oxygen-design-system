import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef, type HTMLAttributes } from 'react';

import { X } from '../Icons';
import { cn } from '../lib/cn';
import { useOxygenThemeAttributes } from './theme-context';
import { useOxygenLocale } from './ConfigProvider';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
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
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  closeLabel?: string;
}

export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ children, className, closeLabel, ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  const { common } = useOxygenLocale();
  const accessibleCloseLabel = closeLabel || common.close;

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        {...themeAttributes}
        className={cn('oxygen-dialog', className)}
        ref={ref}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={accessibleCloseLabel}
          className="oxygen-dialog__close"
          data-oxygen-control="true"
          data-oxygen-icon-button="true"
        >
          <X aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('oxygen-dialog__header', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('oxygen-dialog__footer', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn('oxygen-dialog__title', className)}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn('oxygen-dialog__description', className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
