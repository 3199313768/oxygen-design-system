import * as SliderPrimitive from '@radix-ui/react-slider';
import { forwardRef, useId, useMemo, useState } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export type SliderValue = number | [number, number];

export interface SliderProps extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'defaultValue' | 'disabled' | 'max' | 'min' | 'onChange' | 'onValueChange' | 'step' | 'value'> {
  defaultValue?: SliderValue;
  disabled?: boolean;
  loading?: boolean;
  max?: number;
  min?: number;
  onChange?: (value: SliderValue) => void;
  onValueChange?: (value: SliderValue) => void;
  range?: boolean;
  step?: number;
  value?: SliderValue;
}

function bounds(minProp: number, maxProp: number, stepProp: number) {
  const min = Number.isFinite(minProp) ? minProp : 0;
  const rawMax = Number.isFinite(maxProp) ? maxProp : 100;
  const max = rawMax > min ? rawMax : min + 1;
  const step = Number.isFinite(stepProp) && stepProp > 0 ? stepProp : 1;
  return { min, max, step };
}

function snap(value: number, min: number, max: number, step: number) {
  const safeValue = Number.isFinite(value) ? value : min;
  const next = min + Math.round((safeValue - min) / step) * step;
  // Significant digits preserve fractional minima and scientific-notation steps.
  return Math.min(max, Math.max(min, Number(next.toPrecision(15))));
}

function normalizeValue(value: SliderValue | number[] | undefined, range: boolean, min: number, max: number, step: number): number[] {
  if (range) {
    const values = Array.isArray(value) ? value : [value ?? min, value ?? max];
    const first = snap(values[0], min, max, step);
    const second = snap(values[1], min, max, step);
    return first <= second ? [first, second] : [second, first];
  }
  return [snap(Array.isArray(value) ? value[0] : value ?? min, min, max, step)];
}

function outputValue(values: number[], range: boolean): SliderValue {
  return range ? [values[0] ?? 0, values[1] ?? values[0] ?? 0] : values[0] ?? 0;
}

export const Slider = forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(function Slider(allProps, ref) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    className,
    defaultValue,
    disabled = false,
    form,
    loading = false,
    max: maxProp = 100,
    min: minProp = 0,
    name,
    onChange,
    onValueChange,
    onValueCommit,
    range: rangeProp,
    step: stepProp = 1,
    value: valueProp,
    ...props
  } = allProps;
  const thumbLabelId = useId();
  const locale = useOxygenLocale();
  const range = rangeProp ?? Array.isArray(valueProp ?? defaultValue);
  const { min, max, step } = bounds(minProp, maxProp, stepProp);
  const controlled = 'value' in allProps;
  const initial = useMemo(() => normalizeValue(defaultValue ?? (range ? [min, max] : min), range, min, max, step), [defaultValue, max, min, range, step]);
  const [uncontrolledValue, setUncontrolledValue] = useState(initial);
  const values = normalizeValue(controlled ? valueProp : uncontrolledValue, range, min, max, step);
  // Radix rounds using step precision, which loses a fractional minimum's offset.
  // Give it step positions; keep all public values in the caller's actual units.
  const toPosition = (value: number) => Number(((value - min) / step).toPrecision(15));
  const toActual = (position: number) => Math.min(max, Math.max(min, Number((min + position * step).toPrecision(15))));

  function emit(nextValues: number[]) {
    const next = outputValue(nextValues, range);
    if (!controlled) setUncontrolledValue(nextValues);
    onChange?.(next);
    onValueChange?.(next);
  }

  return (
    <SliderPrimitive.Root
      {...props}
      aria-label={ariaLabel}
      className={cn('oxygen-slider', className)}
      data-oxygen-control="true"
      data-oxygen-loading={loading ? 'true' : undefined}
      data-disabled={disabled || loading ? 'true' : undefined}
      data-range={range ? 'true' : undefined}
      disabled={disabled || loading}
      form={form}
      max={toPosition(max)}
      min={0}
      onValueChange={(next) => emit(next.map(toActual))}
      onValueCommit={(next) => onValueCommit?.(next.map(toActual))}
      ref={ref}
      step={1}
      value={values.map(toPosition)}
    >
      <SliderPrimitive.Track className="oxygen-slider__track">
        <SliderPrimitive.Range className="oxygen-slider__range" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          aria-label={range && ariaLabel ? `${ariaLabel} ${index === 0 ? locale.common.minimum : locale.common.maximum}` : ariaLabel}
          aria-labelledby={range && ariaLabelledBy ? `${ariaLabelledBy} ${thumbLabelId}-${index}` : ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={values[index]}
          className="oxygen-slider__thumb"
          key={index}
        >
          {range && ariaLabelledBy ? <span className="oxygen-visually-hidden" id={`${thumbLabelId}-${index}`}>{index === 0 ? locale.common.minimum : locale.common.maximum}</span> : null}
        </SliderPrimitive.Thumb>
      ))}
      {name ? values.map((value, index) => (
        <input disabled={disabled || loading} form={form} key={`value-${index}`} name={range ? `${name}[]` : name} type="hidden" value={value} />
      )) : null}
    </SliderPrimitive.Root>
  );
});

Slider.displayName = 'Slider';
