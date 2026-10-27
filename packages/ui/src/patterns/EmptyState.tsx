import type { ReactNode } from 'react';

export interface EmptyStateProps {
  action?: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <section className="oxygen-empty-state">
      {icon ? <div className="oxygen-empty-state__icon">{icon}</div> : null}
      <div className="oxygen-empty-state__copy">
        <h2 className="oxygen-empty-state__title">{title}</h2>
        <div className="oxygen-empty-state__description">{description}</div>
      </div>
      {action ? <div className="oxygen-empty-state__action">{action}</div> : null}
    </section>
  );
}
