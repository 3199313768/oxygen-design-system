import { createElement, forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export type TypographyType = 'secondary' | 'success' | 'warning' | 'danger';

interface TypographyToneProps {
  type?: TypographyType;
  strong?: boolean;
}

export interface TypographyTextProps
  extends HTMLAttributes<HTMLSpanElement>,
    TypographyToneProps {}

export const TypographyText = forwardRef<HTMLSpanElement, TypographyTextProps>(
  ({ children, className, strong, type, ...props }, ref) => (
    <span
      className={cn('oxygen-typography', 'oxygen-typography__text', className)}
      data-strong={strong ? 'true' : undefined}
      data-type={type}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  ),
);
TypographyText.displayName = 'TypographyText';

export interface TypographyTitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    TypographyToneProps {
  level?: 1 | 2 | 3 | 4 | 5;
}

export const TypographyTitle = forwardRef<
  HTMLHeadingElement,
  TypographyTitleProps
>(({ children, className, level = 1, strong, type, ...props }, ref) => {
  const tagName = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

  return createElement(
    tagName,
    {
      ...props,
      className: cn('oxygen-typography', 'oxygen-typography__title', className),
      'data-level': level,
      'data-strong': strong ? 'true' : undefined,
      'data-type': type,
      ref,
    },
    children,
  );
});
TypographyTitle.displayName = 'TypographyTitle';

export interface TypographyParagraphProps
  extends HTMLAttributes<HTMLParagraphElement>,
    TypographyToneProps {
  code?: boolean;
}

export const TypographyParagraph = forwardRef<
  HTMLParagraphElement,
  TypographyParagraphProps
>(({ children, className, code, strong, type, ...props }, ref) => (
  <p
    className={cn('oxygen-typography', 'oxygen-typography__paragraph', className)}
    data-code={code ? 'true' : undefined}
    data-strong={strong ? 'true' : undefined}
    data-type={type}
    ref={ref}
    {...props}
  >
    {code ? <code>{children}</code> : children}
  </p>
));
TypographyParagraph.displayName = 'TypographyParagraph';

export interface TypographyLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'>,
    TypographyToneProps {}

export const TypographyLink = forwardRef<HTMLAnchorElement, TypographyLinkProps>(
  ({ children, className, strong, type, ...props }, ref) => (
    <a
      className={cn('oxygen-typography', 'oxygen-typography__link', className)}
      data-strong={strong ? 'true' : undefined}
      data-type={type}
      ref={ref}
      {...props}
    >{children}</a>
  ),
);
TypographyLink.displayName = 'TypographyLink';

export const Typography = {
  Link: TypographyLink,
  Paragraph: TypographyParagraph,
  Text: TypographyText,
  Title: TypographyTitle,
};
