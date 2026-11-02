import {
  Children,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '../lib/cn';

export type SpaceSize = 'small' | 'middle' | 'large' | number;
export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  align?: SpaceAlign;
  direction?: SpaceDirection;
  size?: SpaceSize;
  split?: ReactNode;
  wrap?: boolean;
}

const sizeValues = {
  large: 'var(--oxygen-space-6, 24px)',
  middle: 'var(--oxygen-space-4, 16px)',
  small: 'var(--oxygen-space-2, 8px)',
} as const;

function resolveSize(size: SpaceSize) {
  return typeof size === 'number' ? `${size}px` : sizeValues[size];
}

const SpaceImpl = forwardRef<HTMLDivElement, SpaceProps>(
  (
    {
      align,
      children,
      className,
      direction = 'horizontal',
      size = 'small',
      split,
      style,
      wrap = false,
      ...props
    },
    ref,
  ) => {
    const items = Children.toArray(children);
    const gap = resolveSize(size);
    const content = split
      ? items.flatMap((item, index) =>
          index === items.length - 1
            ? [item]
            : [item, <span key={`split-${index}`}>{split}</span>],
        )
      : items;

    return (
      <div
        className={cn('oxygen-space', className)}
        data-align={align}
        data-direction={direction}
        data-size={typeof size === 'number' ? size : size}
        data-wrap={wrap ? 'true' : undefined}
        ref={ref}
        style={
          {
            ...style,
            '--oxygen-space-gap': gap,
          } as CSSProperties
        }
        {...props}
      >
        {content}
      </div>
    );
  },
);
SpaceImpl.displayName = 'Space';

export interface SpaceCompactProps extends HTMLAttributes<HTMLDivElement> {
  block?: boolean;
}

export const SpaceCompact = forwardRef<HTMLDivElement, SpaceCompactProps>(
  ({ className, block = false, ...props }, ref) => (
    <div
      className={cn('oxygen-space-compact', className)}
      data-block={block ? 'true' : undefined}
      ref={ref}
      {...props}
    />
  ),
);
SpaceCompact.displayName = 'SpaceCompact';

export interface SpaceComponent {
  (props: SpaceProps & { ref?: React.Ref<HTMLDivElement> }): React.ReactElement | null;
  Compact: typeof SpaceCompact;
}

export const Space = Object.assign(SpaceImpl, { Compact: SpaceCompact }) as SpaceComponent;
