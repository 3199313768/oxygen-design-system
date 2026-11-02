import * as ToastPrimitive from '@radix-ui/react-toast';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../lib/cn';
import { useOxygenThemeAttributes } from './theme-context';
import { X } from '../Icons';
import { useOxygenLocale } from './ConfigProvider';

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  return (
    <ToastPrimitive.Viewport
      {...themeAttributes}
      className={cn('oxygen-toast__viewport', className)}
      ref={ref}
      {...props}
    />
  );
});
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export type ToastTone = 'default' | 'success' | 'warning' | 'error';

export type ToastProps = React.ComponentPropsWithoutRef<
  typeof ToastPrimitive.Root
> & {
  tone?: ToastTone;
};

function getToastUpdateText(root: HTMLElement) {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const text: string[] = [];
  while (walker.nextNode()) {
    const parent = walker.currentNode.parentElement;
    if (!parent?.closest('.oxygen-toast__title, .oxygen-toast__description')) continue;
    let element: HTMLElement | null = parent;
    while (element) {
      if (element.getAttribute('aria-hidden') === 'true' || element.hidden || element.style.display === 'none' || element.hasAttribute('data-radix-toast-announce-exclude')) break;
      element = element.parentElement;
    }
    if (!element) text.push(walker.currentNode.textContent ?? '');
  }
  return text.join(' ').replace(/\s+/g, ' ').trim();
}

export const Toast = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, tone = 'default', type = 'foreground', ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  const [node, setNode] = useState<HTMLLIElement | null>(null);
  const updateRegion = useRef<HTMLSpanElement | null>(null);
  const composedRef = useCallback((element: HTMLLIElement | null) => {
    setNode(element);
    const cleanup: unknown = typeof ref === 'function' ? ref(element) : undefined;
    if (ref && typeof ref !== 'function') ref.current = element;
    return () => {
      setNode(null);
      if (typeof cleanup === 'function') cleanup();
      else if (typeof ref === 'function') ref(null);
      else if (ref) ref.current = null;
    };
  }, [ref]);

  useEffect(() => {
    if (!node) return;
    const region = node.ownerDocument.createElement('span');
    region.className = 'oxygen-visually-hidden';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('data-radix-toast-announce-exclude', '');
    node.append(region);
    updateRegion.current = region;
    let wasOpen = node.dataset.state === 'open';
    let previousText = getToastUpdateText(node);
    const observer = new MutationObserver((records) => {
      if (records.every((record) => region.contains(record.target))) return;
      const isOpen = node.dataset.state === 'open';
      const text = getToastUpdateText(node);
      if (!isOpen) region.textContent = '';
      else if (!wasOpen || text !== previousText) region.textContent = text;
      wasOpen = isOpen;
      previousText = text;
    });
    observer.observe(node, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden', 'hidden', 'style', 'data-state'],
    });
    return () => {
      observer.disconnect();
      region.textContent = '';
      region.remove();
      updateRegion.current = null;
    };
  }, [node]);

  useEffect(() => {
    updateRegion.current?.setAttribute('aria-live', type === 'foreground' ? 'assertive' : 'polite');
  }, [node, type]);

  return (
    <ToastPrimitive.Root
      {...themeAttributes}
      className={cn('oxygen-toast', className)}
      data-tone={tone}
      ref={composedRef}
      type={type}
      {...props}
    />
  );
});
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
