import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';
import { TypographyLink } from './Typography';

export interface BreadcrumbItem {
  href?: string;
  label: ReactNode;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, separator = '/', ...props }, ref) => {
    const locale = useOxygenLocale();

    return (
      <nav
        aria-label={locale.common.breadcrumb}
        className={cn('oxygen-breadcrumb', className)}
        ref={ref}
        {...props}
      >
        <ol className="oxygen-breadcrumb__list">
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <li className="oxygen-breadcrumb__item" key={index}>
                {index > 0 ? (
                  <span aria-hidden="true" className="oxygen-breadcrumb__separator">
                    {separator}
                  </span>
                ) : null}
                {item.href !== undefined && !current ? (
                  <TypographyLink className="oxygen-breadcrumb__link" href={item.href}>
                    {item.label}
                  </TypographyLink>
                ) : (
                  <span aria-current={current ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';
