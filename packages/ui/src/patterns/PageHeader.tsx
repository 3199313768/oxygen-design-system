import type { ReactNode } from 'react';

export interface PageHeaderProps {
  actions?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ actions, description, title }: PageHeaderProps) {
  return (
    <header className="oxygen-page-header">
      <div className="oxygen-page-header__copy">
        <h1 className="oxygen-page-header__title">{title}</h1>
        {description ? (
          <div className="oxygen-page-header__description">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="oxygen-page-header__actions">{actions}</div> : null}
    </header>
  );
}
