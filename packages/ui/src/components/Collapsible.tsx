import { createContext, forwardRef, useContext, useId, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';

import { ChevronDown } from '../Icons';
import { cn } from '../lib/cn';

interface CollapsibleContextValue {
  contentId: string;
  disabled: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export interface CollapsibleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ children, className, defaultOpen = false, disabled = false, onOpenChange, open: controlledOpen, ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const open = controlledOpen ?? uncontrolledOpen;
    const contentId = useId();
    const setOpen = (next: boolean) => {
      if (disabled) return;
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    return (
      <CollapsibleContext.Provider value={{ contentId, disabled, open, setOpen }}>
        <div className={cn('oxygen-collapsible', className)} data-state={open ? 'open' : 'closed'} data-disabled={disabled || undefined} ref={ref} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  },
);
Collapsible.displayName = 'Collapsible';

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, disabled, onClick, onKeyDown, type = 'button', ...props }, ref) => {
    const context = useContext(CollapsibleContext);
    if (!context) throw new Error('CollapsibleTrigger must be used within Collapsible');

    const toggle = () => context.setOpen(!context.open);
    return (
      <button
        {...props}
        aria-controls={context.contentId}
        aria-expanded={context.open}
        className={cn('oxygen-collapsible__trigger', className)}
        data-oxygen-control="true"
        disabled={disabled || context.disabled}
        onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) toggle(); }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            toggle();
          }
        }}
        ref={ref}
        type={type}
      >
        <span>{children}</span>
        <ChevronDown aria-hidden="true" className="oxygen-collapsible__icon" />
      </button>
    );
  },
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export interface CollapsibleContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'aria-hidden' | 'children' | 'hidden' | 'id'> {
  children?: ReactNode;
  forceMount?: boolean;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className, forceMount = false, ...props }, ref) => {
    const context = useContext(CollapsibleContext);
    if (!context) throw new Error('CollapsibleContent must be used within Collapsible');
    if (!context.open && !forceMount) return null;
    return (
      <div
        {...props}
        aria-hidden={!context.open}
        className={cn('oxygen-collapsible__content', className)}
        data-state={context.open ? 'open' : 'closed'}
        hidden={!context.open}
        id={context.contentId}
        ref={ref}
      >
        {children}
      </div>
    );
  },
);
CollapsibleContent.displayName = 'CollapsibleContent';
