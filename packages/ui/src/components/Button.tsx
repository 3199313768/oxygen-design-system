import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  forwardRef,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { cn } from '../lib/cn';

export const buttonVariants = cva('oxygen-button', {
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
  variants: {
    size: {
      default: 'oxygen-button--default-size',
      icon: 'oxygen-button--icon',
      sm: 'oxygen-button--sm',
    },
    variant: {
      default: 'oxygen-button--default',
      destructive: 'oxygen-button--destructive',
      ghost: 'oxygen-button--ghost',
      link: 'oxygen-button--link',
      secondary: 'oxygen-button--secondary',
    },
  },
});

interface ButtonSharedProps
  extends ButtonHTMLAttributes<HTMLElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

type ButtonDefaultProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  asChild?: false;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

type ButtonAsChildProps = Omit<ButtonSharedProps, 'asChild' | 'children'> & {
  asChild: true;
  children: ReactElement;
  ref?: Ref<HTMLElement>;
};

export type ButtonProps = ButtonDefaultProps | ButtonAsChildProps;

export interface ButtonComponent {
  (props: ButtonProps): ReactElement | null;
}

const ButtonImpl = forwardRef<HTMLElement, ButtonSharedProps>(
  ({
    asChild = false,
    children,
    className,
    disabled,
    loading = false,
    onClick,
    onClickCapture,
    size,
    variant,
    ...props
  }, ref) => {
    const classes = cn(buttonVariants({ size, variant }), className);
    const dataProps = {
      'data-oxygen-control': 'true',
      'data-oxygen-icon-button': size === 'icon' ? 'true' : undefined,
      'data-oxygen-slotted': asChild ? 'true' : undefined,
      'data-oxygen-loading': loading ? 'true' : undefined,
      'data-size': size ?? 'default',
      'data-variant': variant ?? 'default',
      'aria-busy': loading ? true : undefined,
      'aria-disabled': disabled || loading ? true : undefined,
    };
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };
    const loadingIndicator = loading ? (
      <span
        aria-hidden="true"
        className="oxygen-button__loading-indicator"
        data-oxygen-loading-indicator="true"
      />
    ) : null;

    if (asChild) {
      return (
        <Slot
          className={classes}
          onClick={handleClick}
          ref={ref}
          {...dataProps}
          {...props}
          onClickCapture={(event) => {
            if (disabled || loading) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            onClickCapture?.(event);
          }}
          tabIndex={disabled || loading ? -1 : props.tabIndex}
          onKeyDownCapture={disabled || loading ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
            event.stopPropagation();
          } : props.onKeyDownCapture}
          onKeyUpCapture={disabled || loading ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
            event.stopPropagation();
          } : props.onKeyUpCapture}
        >
          {(disabled || loading) && isValidElement<React.HTMLAttributes<HTMLElement>>(children)
            ? cloneElement(children, {
              tabIndex: -1,
              // Slot composes child handlers first, so remove them before capture guards run.
              onClickCapture: undefined,
              onKeyDownCapture: undefined,
              onKeyUpCapture: undefined,
            })
            : children}
        </Slot>
      );
    }

    return (
      <button
        className={classes}
        disabled={disabled || loading}
        onClick={handleClick}
        onClickCapture={onClickCapture}
        ref={ref as Ref<HTMLButtonElement>}
        {...dataProps}
        {...props}
      >
        {loadingIndicator}
        {children}
      </button>
    );
  },
);

ButtonImpl.displayName = 'Button';

export const Button = ButtonImpl as ButtonComponent;
