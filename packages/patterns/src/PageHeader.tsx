import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  actions?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader({ actions, className, description, title, ...props }, ref) {
  return (
    <header {...props} className={['oxygen-page-header', className].filter(Boolean).join(' ')} ref={ref}>
      <div className="oxygen-page-header__copy">
        <h1 className="oxygen-page-header__title">{title}</h1>
        {description ? (
          <div className="oxygen-page-header__description">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="oxygen-page-header__actions">{actions}</div> : null}
    </header>
  );
});
