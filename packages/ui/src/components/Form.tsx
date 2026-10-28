import {
  Children,
  forwardRef,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from '../lib/cn';
import {
  Field,
  FieldControl,
  FieldLabel,
} from './Field';

export type FormLayout = 'horizontal' | 'inline' | 'vertical';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout;
}

export const FormRoot = forwardRef<HTMLFormElement, FormProps>(
  ({ className, layout = 'vertical', ...props }, ref) => (
    <form
      className={cn('oxygen-form', className)}
      data-layout={layout}
      ref={ref}
      {...props}
    />
  ),
);

FormRoot.displayName = 'Form';

export type FormItemValidateStatus = 'error' | 'success' | 'warning';

export interface FormItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  children: ReactElement;
  help?: ReactNode;
  label?: ReactNode;
  name?: string;
  required?: boolean;
  validateStatus?: FormItemValidateStatus;
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  (
    {
      children,
      className,
      help,
      label,
      name,
      required = false,
      validateStatus,
      ...props
    },
    ref,
  ) => {
    const fieldHelp = validateStatus === 'error' ? undefined : help;
    const fieldError = validateStatus === 'error' ? help : undefined;

    return (
      <Field
        className={cn('oxygen-form-item', className)}
        description={fieldHelp}
        error={fieldError}
        id={name}
        invalid={validateStatus === 'error'}
        ref={ref}
        data-status={validateStatus}
        {...props}
      >
        {label ? (
          <FieldLabel>
            {required ? (
              <>
                <span aria-hidden="true" className="oxygen-form-item__required">
                  *
                </span>
                {label}
              </>
            ) : (
              label
            )}
          </FieldLabel>
        ) : null}
        <FieldControl aria-required={required ? true : undefined}>
          {Children.only(children)}
        </FieldControl>
      </Field>
    );
  },
);

FormItem.displayName = 'FormItem';

export interface FormComponent {
  (props: FormProps & { ref?: React.Ref<HTMLFormElement> }): ReactElement | null;
  Item: typeof FormItem;
}

export const Form = Object.assign(FormRoot, { Item: FormItem }) as FormComponent;
