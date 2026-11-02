import { createRef, type HTMLAttributes, type ReactElement, type Ref } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppShell, EmptyState, PageHeader, StatusMessage } from '../src';

describe('pattern root extension', () => {
  const cases: [string, string, (props: HTMLAttributes<HTMLElement> & { ref: Ref<HTMLElement> }) => ReactElement][] = [
    ['AppShell', 'oxygen-app-shell', (props) => <AppShell {...props} ref={props.ref as Ref<HTMLDivElement>} title="Workspace" sidebar="Sidebar" mobileNavigation="Navigation">Content</AppShell>],
    ['EmptyState', 'oxygen-empty-state', (props) => <EmptyState {...props} title={<span>Empty</span>} description="No items" />],
    ['PageHeader', 'oxygen-page-header', (props) => <PageHeader {...props} title={<span>Page</span>} />],
    ['StatusMessage', 'oxygen-status-message', (props) => <StatusMessage {...props} ref={props.ref as Ref<HTMLDivElement>} title={<span>Status</span>} tone="error">Retry</StatusMessage>],
  ];

  it.each(cases)('%s merges native props and preserves root classes, events and ref', (_name, baseClass, element) => {
    const ref = createRef<HTMLElement>();
    const targets: HTMLElement[] = [];
    render(element({
      'aria-label': 'Extended root',
      className: 'consumer-class',
      id: 'consumer-root',
      onClick: (event) => targets.push(event.currentTarget),
      ref,
      style: { marginTop: 12 },
      tabIndex: 0,
    }));
    const root = screen.getByLabelText('Extended root');
    expect(root).toHaveClass(baseClass, 'consumer-class');
    expect(root).toHaveAttribute('id', 'consumer-root');
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveStyle({ marginTop: '12px' });
    expect(ref.current).toBe(root);
    fireEvent.click(root);
    expect(targets).toEqual([root]);
    if (baseClass === 'oxygen-status-message') {
      expect(root).toHaveClass('oxygen-alert');
      expect(root).toHaveAttribute('role', 'alert');
      expect(root).toHaveAttribute('data-tone', 'error');
    }
  });
});
