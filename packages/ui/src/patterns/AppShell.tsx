import type { ReactNode } from 'react';

import { Menu } from '../Icons';
import { Button } from '../components/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/Sheet';

export interface AppShellProps {
  children: ReactNode;
  mobileNavigation: ReactNode;
  sidebar: ReactNode;
  title: string;
  topbarActions?: ReactNode;
}

export function AppShell({
  children,
  mobileNavigation,
  sidebar,
  title,
  topbarActions,
}: AppShellProps) {
  return (
    <div className="oxygen-app-shell">
      <aside className="oxygen-app-shell__sidebar">{sidebar}</aside>
      <div className="oxygen-app-shell__body">
        <header className="oxygen-app-shell__topbar">
          <Sheet>
            <SheetTrigger asChild>
              <Button aria-label="打开导航" size="icon" variant="ghost">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{title}导航</SheetTitle>
                <SheetDescription>选择要打开的页面</SheetDescription>
              </SheetHeader>
              <div className="oxygen-app-shell__mobile-navigation">
                {mobileNavigation}
              </div>
            </SheetContent>
          </Sheet>
          <div className="oxygen-app-shell__title">{title}</div>
          {topbarActions ? (
            <div className="oxygen-app-shell__actions">{topbarActions}</div>
          ) : null}
        </header>
        <main className="oxygen-app-shell__content">{children}</main>
      </div>
    </div>
  );
}
