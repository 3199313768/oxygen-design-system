import { forwardRef, useId, type HTMLAttributes, type MouseEventHandler } from 'react';

import { X } from '../Icons';
import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export type TagTone = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  closable?: boolean;
  /** Overrides the accessible close name; provide for decorative/icon-only labels. */
  closeLabel?: string;
  disabled?: boolean;
  /** Requests removal; the caller controls whether the tag remains rendered. */
  onClose?: MouseEventHandler<HTMLButtonElement>;
  tone?: TagTone;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ children, className, closable, closeLabel, disabled, onClose, tone = 'default', ...props }, ref) => {
    const locale = useOxygenLocale();
    const labelId = useId();
    const removeId = useId();

    return (
      <span
        {...props}
        aria-disabled={disabled || undefined}
        className={cn('oxygen-tag', className)}
        data-disabled={disabled ? 'true' : undefined}
        data-tone={tone}
        ref={ref}
      >
        <span className="oxygen-tag__label" id={labelId}>{children}</span>
        {closable ? (
          <button
            aria-label={closeLabel}
            aria-labelledby={closeLabel === undefined ? `${removeId} ${labelId}` : undefined}
            className="oxygen-tag__close"
            data-oxygen-icon-button="true"
            disabled={disabled}
            onClick={onClose}
            type="button"
          >
            <span className="oxygen-visually-hidden" id={removeId}>{locale.common.remove}</span>
            <X aria-hidden="true" />
          </button>
        ) : null}
      </span>
    );
  },
);

Tag.displayName = 'Tag';
