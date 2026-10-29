import { Slot } from '@radix-ui/react-slot';
import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '../lib/cn';
import { Label, type LabelProps } from './Label';
import { FieldContextProvider, useFieldContext } from './field-context';

function hasContent(value: ReactNode) {
  if (Array.isArray(value)) return value.some(hasContent);
  if (isValidElement<{ children?: ReactNode }>(value) && value.type === Fragment) {
    return hasContent(value.props.children);
  }
  return value !== undefined && value !== null && typeof value !== 'boolean' && value !== '';
}

function prepareMessages(children: ReactNode, controlId: string) {
  const selected: { description?: string; error?: string } = {};
  const counts = { description: 0, error: 0 };
  function visit(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (child) => {
      if (!isValidElement<HTMLAttributes<HTMLParagraphElement>>(child)) return child;
      if (child.type === Fragment) return cloneElement(child, undefined, visit(child.props.children));
      const kind = child.type === FieldDescription ? 'description' : child.type === FieldError ? 'error' : undefined;
      if (!kind) return child;
      const index = counts[kind]++;
      // Every declaration owns its ID, including hidden or supplemental messages.
      // Prop-based messages keep the unsuffixed ID and remain authoritative.
      const id = child.props.id ?? `${controlId}-${kind}-${index}`;
      if (selected[kind] === undefined && !child.props.hidden && hasContent(child.props.children)) {
        selected[kind] = id;
      }
      return cloneElement(child, { id });
    });
  }
  return { children: visit(children), selected };
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  description?: ReactNode;
  error?: ReactNode;
  id?: string;
  invalid?: boolean;
  required?: boolean;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      children,
      className,
      description,
      error,
      id,
      invalid = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const controlId = id ?? `${generatedId}-control`;
    const hasDescriptionProp = hasContent(description);
    const hasErrorProp = hasContent(error);
    const messages = prepareMessages(children, controlId);
    const value = {
      controlId,
      descriptionId: hasDescriptionProp ? `${controlId}-description` : messages.selected.description ?? `${controlId}-description`,
      errorId: hasErrorProp ? `${controlId}-error` : messages.selected.error ?? `${controlId}-error`,
      hasDescription: hasDescriptionProp || messages.selected.description !== undefined,
      hasError: hasErrorProp || messages.selected.error !== undefined,
      invalid,
      required,
    };

    return (
      <FieldContextProvider value={value}>
        <div className={cn('oxygen-field', className)} ref={ref} {...props}>
          {messages.children}
          {hasDescriptionProp ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {hasErrorProp ? <FieldError>{error}</FieldError> : null}
        </div>
      </FieldContextProvider>
    );
  },
);

Field.displayName = 'Field';

export type FieldLabelProps = LabelProps;

export const FieldLabel = forwardRef<
  ElementRef<typeof Label>,
  FieldLabelProps
>(({ htmlFor, ...props }, ref) => {
  const field = useFieldContext();

  return <Label ref={ref} htmlFor={htmlFor ?? field?.controlId} {...props} />;
});

FieldLabel.displayName = 'FieldLabel';

export interface FieldControlProps extends ComponentPropsWithoutRef<typeof Slot> {}

export const FieldControl = forwardRef<HTMLElement, FieldControlProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      children,
      id,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext();
    const describedBy = [
      field?.hasDescription ? field.descriptionId : null,
      field?.hasError ? field.errorId : null,
    ]
      .filter(Boolean)
      .join(' ');
    const resolvedDescribedBy =
      ariaDescribedBy !== undefined
        ? ariaDescribedBy
        : describedBy || undefined;

    return (
      <Slot
        aria-describedby={resolvedDescribedBy}
        aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
        id={id ?? field?.controlId}
        ref={ref}
        {...props}
      >
        {children}
      </Slot>
    );
  },
);

FieldControl.displayName = 'FieldControl';

export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ children, className, id, ...props }, ref) => {
    const field = useFieldContext();

    if (!hasContent(children)) return null;

    return (
      <p
        className={cn('oxygen-field-description', className)}
        id={id ?? field?.descriptionId}
        ref={ref}
        {...props}
      >
        {children}
      </p>
    );
  },
);

FieldDescription.displayName = 'FieldDescription';

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>;

export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ children, className, id, ...props }, ref) => {
    const field = useFieldContext();

    if (!hasContent(children)) return null;

    return (
      <p
        className={cn('oxygen-field-error', className)}
        id={id ?? field?.errorId}
        ref={ref}
        role="alert"
        {...props}
      >
        {children}
      </p>
    );
  },
);

FieldError.displayName = 'FieldError';
