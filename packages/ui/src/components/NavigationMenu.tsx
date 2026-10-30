import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '../lib/cn';
import { OxygenThemeContext, useOxygenThemeAttributes } from './theme-context';

export const NavigationMenu = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    className={cn('oxygen-navigation-menu', className)}
    ref={ref}
    {...props}
  />
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

export const NavigationMenuList = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    className={cn('oxygen-navigation-menu__list', className)}
    ref={ref}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

export const NavigationMenuItem = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    className={cn('oxygen-navigation-menu__item', className)}
    ref={ref}
    {...props}
  />
));
NavigationMenuItem.displayName = NavigationMenuPrimitive.Item.displayName;

export const NavigationMenuTrigger = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ children, className, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);

    if (
      event.defaultPrevented ||
      event.key !== 'ArrowDown' ||
      event.currentTarget.dataset.state !== 'closed' ||
      event.currentTarget.closest('[data-orientation]')?.getAttribute('data-orientation') !== 'horizontal'
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <NavigationMenuPrimitive.Trigger
      className={cn('oxygen-navigation-menu__trigger', className)}
      onKeyDown={handleKeyDown}
      ref={ref}
      {...props}
    >
      {children}
      <ChevronDown aria-hidden="true" className="oxygen-navigation-menu__chevron" />
    </NavigationMenuPrimitive.Trigger>
  );
});
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

export const NavigationMenuContent = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ children, className, ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  return (
    <NavigationMenuPrimitive.Content
      {...themeAttributes}
      className={cn('oxygen-navigation-menu__content', className)}
      ref={ref}
      {...props}
    >
      {/* Radix relocates these children into a shared Viewport; retain their React origin. */}
      <OxygenThemeContext.Provider value={themeAttributes['data-oxygen-theme']}>
        {children}
      </OxygenThemeContext.Provider>
    </NavigationMenuPrimitive.Content>
  );
});
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

export interface NavigationMenuLinkProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link> {}

export const NavigationMenuLink = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Link>,
  NavigationMenuLinkProps
>(({ active, className, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    aria-current={active ? 'page' : undefined}
    className={cn('oxygen-navigation-menu__link', className)}
    data-active={active ? '' : undefined}
    ref={ref}
    {...props}
  />
));
NavigationMenuLink.displayName = NavigationMenuPrimitive.Link.displayName;

export const NavigationMenuViewport = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Viewport
    className={cn('oxygen-navigation-menu__viewport', className)}
    ref={ref}
    {...props}
  />
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

export const NavigationMenuIndicator = forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    className={cn('oxygen-navigation-menu__indicator', className)}
    ref={ref}
    {...props}
  />
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export const NavigationMenuSub = NavigationMenuPrimitive.Sub;
