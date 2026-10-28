import { forwardRef, useEffect, useId, useState, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { Button } from './Button';
import { useOxygenLocale } from './ConfigProvider';
import { Input } from './Input';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  defaultOpen?: boolean;
  /** Optional initial draft for validation/error fixtures; committed output remains normalized. */
  defaultDraftValue?: string;
  defaultValue?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  value?: string;
}

const COLOR_PATTERN = /^#[\da-f]{6}$/i;
const normalizeColor = (value: string | undefined) => COLOR_PATTERN.test(value ?? '') ? value!.toUpperCase() : '#000000';

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(allProps, ref) {
  const {
    'aria-label': ariaLabelProp,
    className,
    defaultDraftValue,
    defaultOpen = false,
    defaultValue,
    disabled = false,
    loading = false,
    onChange,
    onOpenChange,
    open: openProp,
    value: valueProp,
    ...props
  } = allProps;
  const locale = useOxygenLocale();
  const ariaLabel = ariaLabelProp ?? locale.colorPicker.label;
  const errorId = useId();
  const controlled = 'value' in allProps;
  const openControlled = 'open' in allProps;
  const [uncontrolledValue, setUncontrolledValue] = useState(normalizeColor(defaultValue));
  const committed = normalizeColor(controlled ? valueProp : uncontrolledValue);
  const [draft, setDraft] = useState(defaultDraftValue ?? committed);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openControlled ? Boolean(openProp) : uncontrolledOpen;

  useEffect(() => { if (!open) setDraft(committed); }, [committed, open]);

  function setOpen(next: boolean) {
    if (disabled || loading) return;
    setDraft(committed);
    if (!openControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function update(value: string) {
    setDraft(value);
    if (!COLOR_PATTERN.test(value)) return;
    setDraft(value.toUpperCase());
  }

  const invalid = draft !== '' && !COLOR_PATTERN.test(draft);

  return (
    <div {...props} className={cn('oxygen-color-picker', className)} data-disabled={disabled || loading ? 'true' : undefined}>
      <Popover open={open && !disabled && !loading} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            aria-label={ariaLabel}
            className="oxygen-color-picker__trigger"
            data-oxygen-control="true"
            disabled={disabled || loading}
            ref={ref}
            type="button"
          >
            <span aria-hidden="true" className="oxygen-color-picker__swatch" style={{ backgroundColor: committed }} />
            <span>{committed}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="oxygen-color-picker__popover">
          <div className="oxygen-color-picker__fields">
            <Input
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              aria-label={ariaLabel}
              onChange={(event) => update(event.currentTarget.value)}
              value={draft}
            />
            <input
              aria-label={`${ariaLabel} ${locale.colorPicker.nativePicker}`}
              className="oxygen-color-picker__native"
              onChange={(event) => update(event.currentTarget.value)}
              type="color"
              value={COLOR_PATTERN.test(draft) ? draft : '#000000'}
            />
          </div>
          {invalid ? <p className="oxygen-color-picker__error" id={errorId} role="alert">{locale.colorPicker.invalid}</p> : null}
          <div className="oxygen-color-picker__actions">
            <Button onClick={() => setOpen(false)} size="sm" variant="secondary">{locale.colorPicker.cancel}</Button>
            <Button
              disabled={!COLOR_PATTERN.test(draft)}
              onClick={() => {
                const normalized = draft.toUpperCase();
                if (!controlled) setUncontrolledValue(normalized);
                onChange?.(normalized);
                setOpen(false);
              }}
              size="sm"
            >{locale.colorPicker.confirm}</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';
