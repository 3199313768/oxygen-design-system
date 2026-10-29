import * as ToastPrimitive from '@radix-ui/react-toast';
import { forwardRef } from 'react';

import { cn } from '../lib/cn';
import { X } from '../Icons';
import { useOxygenLocale } from './ConfigProvider';

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    className={cn('oxygen-toast__viewport', className)}
    ref={ref}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export type ToastTone = 'default' | 'success' | 'warning' | 'error';

export type ToastProps = React.ComponentPropsWithoutRef<
  typeof ToastPrimitive.Root
> & {
  tone?: ToastTone;
};

export const Toast = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, tone = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    className={cn('oxygen-toast', className)}
    data-tone={tone}
    ref={ref}
    {...props}
  />
));
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastTitle = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    className={cn('oxygen-toast__title', className)}
    ref={ref}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

export const ToastDescription = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    className={cn('oxygen-toast__description', className)}
    ref={ref}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export const ToastAction = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    className={cn('oxygen-toast__action', className)}
    data-oxygen-control="true"
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

export const ToastClose = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ children, className, 'aria-label': ariaLabel, ...props }, ref) => {
  const locale = useOxygenLocale();
  return (
    <ToastPrimitive.Close
      aria-label={ariaLabel ?? (children == null ? locale.common.close : undefined)}
      className={cn('oxygen-toast__close', className)}
      data-oxygen-control="true"
      data-oxygen-icon-button={children == null ? 'true' : undefined}
      ref={ref}
      {...props}
    >
      {children ?? <X aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
});
ToastClose.displayName = ToastPrimitive.Close.displayName;
