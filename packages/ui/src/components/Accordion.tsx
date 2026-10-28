import { forwardRef, useId, useMemo, useState, type HTMLAttributes, type Key, type ReactNode } from 'react';

import { ChevronDown } from '../Icons';
import { cn } from '../lib/cn';

export interface AccordionItem {
  key: Key;
  title: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export type AccordionValue = Key | Key[];

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue'> {
  items?: AccordionItem[];
  type?: 'single' | 'multiple';
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
  collapsible?: boolean;
  disabled?: boolean;
}

const toValues = (value: AccordionValue | undefined, type: AccordionProps['type']): Key[] => {
  if (type === 'multiple') return Array.isArray(value) ? value : value == null ? [] : [value];
  const first = Array.isArray(value) ? value[0] : value;
  return first == null ? [] : [first];
};

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, collapsible = true, defaultValue, disabled = false, items = [], onValueChange, type = 'single', value, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(() => toValues(defaultValue, type));
    const controlled = value !== undefined;
    const openValues = useMemo(() => (controlled ? toValues(value, type) : uncontrolledValue), [controlled, type, uncontrolledValue, value]);
    const id = useId();

    const update = (itemKey: Key) => {
      if (disabled) return;
      const currentlyOpen = openValues.includes(itemKey);
      let next: Key[];
      if (type === 'multiple') {
        next = currentlyOpen ? openValues.filter((key) => key !== itemKey) : [...openValues, itemKey];
      } else if (currentlyOpen) {
        next = collapsible ? [] : openValues;
      } else {
        next = [itemKey];
      }
      if (!controlled) setUncontrolledValue(next);
      onValueChange?.(type === 'multiple' ? next : next[0] ?? '');
    };

    return (
      <div
        aria-multiselectable={type === 'multiple' ? true : undefined}
        className={cn('oxygen-accordion', className)}
        ref={ref}
        {...props}
      >
        {items.map((item, index) => {
          const itemKey = item.key;
          const open = openValues.includes(itemKey);
          // Keep user keys in state while using generated index ids for valid ARIA IDREFs.
          const contentId = `${id}-content-${index}`;
          const triggerId = `${id}-trigger-${index}`;
          const reactKey = `${typeof itemKey}:${String(itemKey)}`;
          const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (!item.disabled) update(itemKey);
            }
          };

          return (
            <div className="oxygen-accordion__item" data-state={open ? 'open' : 'closed'} data-disabled={disabled || item.disabled || undefined} key={reactKey}>
              <h3 className="oxygen-accordion__heading">
                <button
                  aria-controls={contentId}
                  aria-expanded={open}
                  className="oxygen-accordion__trigger"
                  data-oxygen-control="true"
                  disabled={disabled || item.disabled}
                  id={triggerId}
                  onClick={() => update(itemKey)}
                  onKeyDown={handleKeyDown}
                  type="button"
                >
                  <span>{item.title}</span>
                  <ChevronDown aria-hidden="true" className="oxygen-accordion__icon" />
                </button>
              </h3>
              <div aria-hidden={!open} aria-labelledby={triggerId} className="oxygen-accordion__content" hidden={!open} id={contentId} role="region">
                {item.children}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
Accordion.displayName = 'Accordion';
