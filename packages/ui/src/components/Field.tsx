import { Slot } from '@radix-ui/react-slot';
import {
  forwardRef,
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
  return value !== undefined && value !== null && value !== false && value !== '';
}

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  description?: ReactNode;
  error?: ReactNode;
  id?: string;
  invalid?: boolean;
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
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const controlId = id ?? `${generatedId}-control`;
    const value = {
      controlId,
      descriptionId: `${controlId}-description`,
      errorId: `${controlId}-error`,
      hasDescription: hasContent(description),
      hasError: hasContent(error),
      invalid,
    };

    return (
      <FieldContextProvider value={value}>
        <div className={cn('oxygen-field', className)} ref={ref} {...props}>
          {children}
          {value.hasDescription ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {value.hasError ? <FieldError>{error}</FieldError> : null}
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
