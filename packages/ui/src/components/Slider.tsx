import * as SliderPrimitive from '@radix-ui/react-slider';
import { forwardRef, useMemo, useState } from 'react';

import { cn } from '../lib/cn';

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
  const precision = Math.max(0, (String(step).split('.')[1] ?? '').length);
  return Number(Math.min(max, Math.max(min, Number(next.toFixed(precision)))).toFixed(precision));
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
    className,
    defaultValue,
    disabled = false,
    loading = false,
    max: maxProp = 100,
    min: minProp = 0,
    onChange,
    onValueChange,
    range: rangeProp,
    step: stepProp = 1,
    value: valueProp,
    ...props
  } = allProps;
  const range = rangeProp ?? Array.isArray(valueProp ?? defaultValue);
  const { min, max, step } = bounds(minProp, maxProp, stepProp);
  const controlled = 'value' in allProps;
  const initial = useMemo(() => normalizeValue(defaultValue ?? (range ? [min, max] : min), range, min, max, step), [defaultValue, max, min, range, step]);
  const [uncontrolledValue, setUncontrolledValue] = useState(initial);
  const values = normalizeValue(controlled ? valueProp : uncontrolledValue, range, min, max, step);

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
      max={max}
      min={min}
      onValueChange={(next) => emit(normalizeValue(range ? [next[0] ?? min, next[1] ?? max] as [number, number] : next[0] ?? min, range, min, max, step))}
      ref={ref}
      step={step}
      value={values}
    >
      <SliderPrimitive.Track className="oxygen-slider__track">
        <SliderPrimitive.Range className="oxygen-slider__range" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          aria-label={range && ariaLabel ? `${ariaLabel} ${index === 0 ? '最小值' : '最大值'}` : ariaLabel}
          className="oxygen-slider__thumb"
          key={index}
        />
      ))}
    </SliderPrimitive.Root>
  );
});

Slider.displayName = 'Slider';
