import { forwardRef, useEffect, useId, useState, type HTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { Button } from './Button';
import { useOxygenLocale } from './ConfigProvider';
import { Input } from './Input';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { useFieldContext } from './field-context';

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
const mergeIds = (...values: (string | undefined)[]) => [...new Set(values.flatMap((value) => value?.split(/\s+/).filter(Boolean) ?? []))].join(' ') || undefined;

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(allProps, ref) {
  const {
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    className,
    defaultDraftValue,
    defaultOpen = false,
    defaultValue,
    disabled = false,
    loading = false,
    id,
    onChange,
    onOpenChange,
    open: openProp,
    value: valueProp,
    ...props
  } = allProps;
  const locale = useOxygenLocale();
  const field = useFieldContext();
  const ariaLabel = ariaLabelProp ?? locale.colorPicker.label;
  const errorId = useId();
  const triggerId = id ?? field?.controlId ?? `${errorId}-trigger`;
  const valueId = `${errorId}-value`;
  const requiredId = `${errorId}-required`;
  const invalidId = `${errorId}-invalid`;
  const required = ariaRequired ?? field?.required;
  const externalInvalid = ariaInvalid ?? (field?.invalid ? true : undefined);
  const isRequired = required === true || required === 'true';
  const isExternallyInvalid = externalInvalid !== undefined && externalInvalid !== false && externalInvalid !== 'false';
  const needsInvalidDescription = isExternallyInvalid && !field?.hasError;
  const describedBy = mergeIds(
    ariaDescribedBy,
    field?.hasDescription ? field.descriptionId : undefined,
    field?.hasError ? field.errorId : undefined,
  );
  const editorLabelledBy = ariaLabelledBy ?? (field && ariaLabelProp === undefined ? triggerId : undefined);
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
            aria-label={ariaLabelProp ?? (field ? undefined : ariaLabel)}
            // A self-reference retains aria-label/native FieldLabel naming before the visible value.
            aria-labelledby={mergeIds(ariaLabelledBy?.trim() || triggerId, valueId)}
            aria-describedby={mergeIds(describedBy, isRequired ? requiredId : undefined, needsInvalidDescription ? invalidId : undefined)}
            className="oxygen-color-picker__trigger"
            data-invalid={isExternallyInvalid ? 'true' : undefined}
            data-oxygen-control="true"
            disabled={disabled || loading}
            id={triggerId}
            ref={ref}
            type="button"
          >
            <span aria-hidden="true" className="oxygen-color-picker__swatch" style={{ backgroundColor: committed }} />
            <span id={valueId}>{committed}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" aria-label={ariaLabel} aria-labelledby={editorLabelledBy} className="oxygen-color-picker__popover">
          <div className="oxygen-color-picker__fields">
            <Input
              aria-invalid={invalid ? true : externalInvalid}
              aria-required={required}
              aria-describedby={mergeIds(describedBy, needsInvalidDescription ? invalidId : undefined, invalid ? errorId : undefined)}
              aria-label={ariaLabel}
              aria-labelledby={editorLabelledBy}
              onChange={(event) => update(event.currentTarget.value)}
              value={draft}
            />
            <input
              aria-describedby={describedBy}
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
      {isRequired ? <span className="oxygen-visually-hidden" id={requiredId}>{locale.colorPicker.required}</span> : null}
      {needsInvalidDescription ? <span className="oxygen-visually-hidden" id={invalidId}>{locale.colorPicker.invalidDescription}</span> : null}
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';
