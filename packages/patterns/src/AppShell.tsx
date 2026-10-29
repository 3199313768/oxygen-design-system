import type { ReactNode } from 'react';

import {
  Button,
  Menu,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  useOxygenLocale,
} from '@oxygen-design/ui';

export interface AppShellProps {
  children: ReactNode;
  mobileNavigation: ReactNode;
  navigationDescription?: string;
  navigationTitle?: string;
  navigationTriggerLabel?: string;
  sidebar: ReactNode;
  title: string;
  topbarActions?: ReactNode;
}

export function AppShell({
  children,
  mobileNavigation,
  navigationDescription,
  navigationTitle,
  navigationTriggerLabel,
  sidebar,
  title,
  topbarActions,
}: AppShellProps) {
  const locale = useOxygenLocale();
  const navigationTitleFormatter = (locale.common as typeof locale.common & {
    navigationTitle?: (value: string) => string;
  }).navigationTitle;
  const resolvedNavigationTitle = navigationTitle ?? navigationTitleFormatter?.(title) ?? `${title}导航`;
  const resolvedNavigationDescription = navigationDescription ?? locale.common.navigationDescription;
  const resolvedNavigationTriggerLabel = navigationTriggerLabel ?? locale.common.openNavigation;

  return (
    <div className="oxygen-app-shell">
      <aside className="oxygen-app-shell__sidebar">{sidebar}</aside>
      <div className="oxygen-app-shell__body">
        <header className="oxygen-app-shell__topbar">
          <Sheet>
            <SheetTrigger asChild>
              <Button aria-label={resolvedNavigationTriggerLabel} size="icon" variant="ghost">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>{resolvedNavigationTitle}</SheetTitle>
                <SheetDescription>{resolvedNavigationDescription}</SheetDescription>
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
