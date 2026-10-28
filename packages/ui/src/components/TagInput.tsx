import { forwardRef, useImperativeHandle, useRef, useState, type InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { Input } from './Input';
import { Tag } from './Tag';

export interface TagInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'form' | 'formAction' | 'formEncType' | 'formMethod' |
    'formNoValidate' | 'formTarget' | 'max' | 'name' | 'onChange' | 'required' | 'type' | 'value'
  > {
  allowDuplicates?: boolean;
  defaultValue?: string[];
  /** Maximum number of tokens; existing tokens may still be removed at the limit. */
  max?: number;
  /** Manage form values and token validation through this callback and value. */
  onChange?: (value: string[]) => void;
  value?: string[];
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ allowDuplicates = false, className, defaultValue = [], disabled, max, onChange, onKeyDown, readOnly, value: valueProp, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);
    const value = valueProp ?? uncontrolledValue;

    function update(next: string[]) {
      if (disabled || readOnly) return;
      if (valueProp === undefined) setUncontrolledValue(next);
      onChange?.(next);
    }

    function commit() {
      const token = draft.trim();
      if (!token || (!allowDuplicates && value.includes(token))) {
        setDraft('');
        return;
      }
      if (max !== undefined && value.length >= Math.max(0, Math.floor(max))) return;
      update([...value, token]);
      setDraft('');
    }

    return (
      <div
        className={cn('oxygen-tag-input', className)}
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={props['aria-invalid'] === true || props['aria-invalid'] === 'true' ? 'true' : undefined}
      >
        {value.map((token, index) => (
          <Tag
            closable
            disabled={disabled || readOnly}
            key={index}
            onClose={() => {
              // Focus a stable element before the owner can remove the active button.
              inputRef.current?.focus();
              update(value.filter((_, tokenIndex) => tokenIndex !== index));
            }}
          >
            {token}
          </Tag>
        ))}
        <Input
          {...props}
          className="oxygen-tag-input__input"
          disabled={disabled}
          onChange={(event) => {
            if (!disabled && !readOnly) setDraft(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled || readOnly || event.nativeEvent.isComposing || event.keyCode === 229) return;
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            }
          }}
          readOnly={readOnly}
          ref={inputRef}
          value={draft}
        />
      </div>
    );
  },
);

TagInput.displayName = 'TagInput';
