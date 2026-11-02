import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  action?: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(function EmptyState({ action, className, description, icon, title, ...props }, ref) {
  return (
    <section {...props} className={['oxygen-empty-state', className].filter(Boolean).join(' ')} ref={ref}>
      {icon ? <div className="oxygen-empty-state__icon">{icon}</div> : null}
      <div className="oxygen-empty-state__copy">
        <h2 className="oxygen-empty-state__title">{title}</h2>
        <div className="oxygen-empty-state__description">{description}</div>
      </div>
      {action ? <div className="oxygen-empty-state__action">{action}</div> : null}
    </section>
  );
});
