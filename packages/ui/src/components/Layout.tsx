import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactElement } from 'react';

import { cn } from '../lib/cn';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  hasSider?: boolean;
}

export const LayoutRoot = forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, hasSider = false, ...props }, ref) => (
    <div
      className={cn('oxygen-layout', className)}
      data-has-sider={hasSider ? 'true' : undefined}
      ref={ref}
      {...props}
    />
  ),
);
LayoutRoot.displayName = 'Layout';

export type LayoutHeaderProps = HTMLAttributes<HTMLElement>;

export const LayoutHeader = forwardRef<HTMLElement, LayoutHeaderProps>(
  ({ className, ...props }, ref) => (
    <header className={cn('oxygen-layout__header', className)} ref={ref} {...props} />
  ),
);
LayoutHeader.displayName = 'LayoutHeader';

export interface LayoutSiderProps extends HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  width?: number | string;
}

export const LayoutSider = forwardRef<HTMLElement, LayoutSiderProps>(
  ({ className, collapsed = false, style, width = 200, ...props }, ref) => (
    <aside
      className={cn('oxygen-layout__sider', className)}
      data-collapsed={collapsed ? 'true' : undefined}
      ref={ref}
      style={
        {
          ...style,
          '--oxygen-layout-sider-width':
            typeof width === 'number' ? `${width}px` : width,
        } as CSSProperties
      }
      {...props}
    />
  ),
);
LayoutSider.displayName = 'LayoutSider';

export type LayoutContentProps = HTMLAttributes<HTMLElement>;

export const LayoutContent = forwardRef<HTMLElement, LayoutContentProps>(
  ({ className, ...props }, ref) => (
    <main className={cn('oxygen-layout__content', className)} ref={ref} {...props} />
  ),
);
LayoutContent.displayName = 'LayoutContent';

export type LayoutFooterProps = HTMLAttributes<HTMLElement>;

export const LayoutFooter = forwardRef<HTMLElement, LayoutFooterProps>(
  ({ className, ...props }, ref) => (
    <footer className={cn('oxygen-layout__footer', className)} ref={ref} {...props} />
  ),
);
LayoutFooter.displayName = 'LayoutFooter';

export interface LayoutComponent {
  (props: LayoutProps & { ref?: React.Ref<HTMLDivElement> }): ReactElement | null;
  Content: typeof LayoutContent;
  Footer: typeof LayoutFooter;
  Header: typeof LayoutHeader;
  Sider: typeof LayoutSider;
}

export const Layout = Object.assign(LayoutRoot, {
  Content: LayoutContent,
  Footer: LayoutFooter,
  Header: LayoutHeader,
  Sider: LayoutSider,
}) as LayoutComponent;
