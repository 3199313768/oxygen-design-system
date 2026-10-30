import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef, type HTMLAttributes } from 'react';

import { Check, ChevronDown } from '../Icons';
import { cn } from '../lib/cn';
import { useOxygenThemeAttributes } from './theme-context';
import { useFieldContext } from './field-context';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export type SelectTriggerProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
>;

export const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, id, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedBy, 'aria-required': ariaRequired, ...props }, ref) => {
  const field = useFieldContext();
  const describedBy = [
    field?.hasDescription ? field.descriptionId : null,
    field?.hasError ? field.errorId : null,
  ].filter(Boolean).join(' ');

  return (
  <SelectPrimitive.Trigger
    aria-describedby={ariaDescribedBy !== undefined ? ariaDescribedBy : describedBy || undefined}
    aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
    aria-required={ariaRequired ?? (field?.required ? true : undefined)}
    className={cn('oxygen-select__trigger', className)}
    data-oxygen-control="true"
    id={id ?? field?.controlId}
    ref={ref}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon aria-hidden="true" asChild>
      <ChevronDown />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export type SelectContentProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
>;

export const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = 'popper', ...props }, ref) => {
  const themeAttributes = useOxygenThemeAttributes();
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        {...themeAttributes}
        className={cn('oxygen-select__content', className)}
        position={position}
        ref={ref}
        {...props}
      >
        <SelectPrimitive.Viewport className="oxygen-select__viewport">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

export type SelectItemProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
>;

export const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    className={cn('oxygen-select__item', className)}
    ref={ref}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="oxygen-select__item-indicator">
      <Check aria-hidden="true" />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectLabel = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    className={cn('oxygen-select__label', className)}
    ref={ref}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    className={cn('oxygen-select__separator', className)}
    ref={ref}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export const SelectScrollUpButton = SelectPrimitive.ScrollUpButton;
export const SelectScrollDownButton = SelectPrimitive.ScrollDownButton;

export type SelectSeparatorProps = HTMLAttributes<HTMLDivElement>;
