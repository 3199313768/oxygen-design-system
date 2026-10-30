import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export interface InputNumberProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'onChange' | 'type' | 'value'> {
  defaultValue?: number;
  formatter?: (value: number | undefined) => string;
  max?: number;
  min?: number;
  onChange?: (value: number | undefined) => void;
  parser?: (value: string) => number | undefined;
  precision?: number;
  step?: number;
  value?: number;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (allProps, ref) => {
    const {
      className, defaultValue, disabled, formatter, max, min, onBlur, onChange,
      onFocus, onKeyDown, parser, precision, readOnly, step = 1, value: valueProp,
      ...props
    } = allProps;
    const locale = useOxygenLocale();
    const controlled = 'value' in allProps;

    function normalize(next: number | undefined) {
      if (next === undefined || !Number.isFinite(next)) return undefined;
      const digits = precision !== undefined && Number.isFinite(precision)
        ? Math.min(100, Math.max(0, Math.floor(precision))) : undefined;
      const rounded = digits === undefined ? next : Number(next.toFixed(digits));
      const lower = min !== undefined && Number.isFinite(min) ? Math.max(min, rounded) : rounded;
      return max !== undefined && Number.isFinite(max) ? Math.min(max, lower) : lower;
    }

    const format = useCallback((next: number | undefined) => {
      return formatter ? formatter(next) : next === undefined ? '' : String(next);
    }, [formatter]);

    function parse(raw: string) {
      if (raw.trim() === '') return undefined;
      return parser ? parser(raw) : Number(raw);
    }

    const [uncontrolledValue, setUncontrolledValue] = useState(() => normalize(defaultValue));
    const value = normalize(controlled ? valueProp : uncontrolledValue);
    const [focused, setFocused] = useState(false);
    const [draft, setDraft] = useState(() => format(value));
    const lastEmitted = useRef(value);
    const previousValue = useRef(value);

    useEffect(() => {
      // Parent echoes of our own edits must preserve intermediate input text.
      if (!Object.is(previousValue.current, value)) {
        if (!focused || !Object.is(lastEmitted.current, value)) setDraft(format(value));
        previousValue.current = value;
        lastEmitted.current = value;
      }
    }, [value, focused, format]);

    function updateValue(next: number | undefined) {
      const normalized = normalize(next);
      if (!controlled) setUncontrolledValue(normalized);
      if (!Object.is(lastEmitted.current, normalized)) {
        lastEmitted.current = normalized;
        onChange?.(normalized);
      }
      return normalized;
    }

    function commit() {
      const parsed = parse(draft);
      const next = draft.trim() === '' ? updateValue(undefined)
        : parsed !== undefined && Number.isFinite(parsed) ? updateValue(parsed) : value;
      setDraft(format(next));
    }

    function changeBy(direction: 1 | -1) {
      if (disabled || readOnly || !Number.isFinite(step) || step <= 0) return;
      const parsed = focused ? parse(draft) : value;
      const base = parsed !== undefined && Number.isFinite(parsed) ? parsed : value ?? min ?? 0;
      // Decimal steps otherwise accumulate binary floating-point noise.
      const stepped = Number((base + direction * step).toPrecision(15));
      const next = updateValue(stepped);
      setDraft(format(next));
    }

    return (
      <div className={cn('oxygen-input-number', className)}>
        <input
          {...props}
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={value}
          aria-valuetext={formatter ? format(value) : undefined}
          className="oxygen-input-number__input"
          disabled={disabled}
          inputMode="decimal"
          onBlur={(event) => {
            commit();
            setFocused(false);
            onBlur?.(event);
          }}
          onChange={(event) => {
            const raw = event.currentTarget.value;
            setDraft(raw);
            const parsed = parse(raw);
            const incomplete = !formatter && (/^[+-]?$/.test(raw) || /[.eE][+-]?$/.test(raw));
            if (raw.trim() === '') updateValue(undefined);
            else if (!incomplete && parsed !== undefined && Number.isFinite(parsed)) updateValue(parsed);
          }}
          onFocus={(event) => {
            setDraft(format(value));
            setFocused(true);
            onFocus?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled || readOnly || event.nativeEvent.isComposing) return;
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault();
              changeBy(event.key === 'ArrowUp' ? 1 : -1);
            } else if (event.key === 'Enter') {
              commit();
            } else if (event.key === 'Escape') {
              setDraft(format(value));
            }
          }}
          readOnly={readOnly}
          ref={ref}
          role="spinbutton"
          type="text"
          value={focused ? draft : format(value)}
        />
        <span className="oxygen-input-number__controls">
          <button
            aria-label={locale.common.increase}
            className="oxygen-input-number__button"
            disabled={disabled || readOnly || (max !== undefined && value !== undefined && value >= max)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => changeBy(1)}
            type="button"
          >+</button>
          <button
            aria-label={locale.common.decrease}
            className="oxygen-input-number__button"
            disabled={disabled || readOnly || (min !== undefined && value !== undefined && value <= min)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => changeBy(-1)}
            type="button"
          >−</button>
        </span>
      </div>
    );
  },
);

InputNumber.displayName = 'InputNumber';
