import { forwardRef, useEffect, useState, type ImgHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: ReactNode;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ alt = '', className, fallback, onError, src, ...props }, ref) => {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);

    if (failed) {
      return (
        <span
          aria-hidden={alt ? undefined : true}
          aria-label={alt || undefined}
          className={cn('oxygen-image__fallback', className)}
          role={alt ? 'img' : undefined}
        >
          {fallback !== undefined ? fallback : '图片加载失败'}
        </span>
      );
    }

    return (
      <img
        alt={alt}
        className={cn('oxygen-image', className)}
        onError={(event) => {
          setFailed(true);
          onError?.(event);
        }}
        ref={ref}
        src={src}
        {...props}
      />
    );
  },
);
Image.displayName = 'Image';
