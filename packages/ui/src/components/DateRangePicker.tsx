import { useEffect, useState, type ReactNode } from 'react';
import {
  DateLib,
  dateMatchModifiers,
  rangeContainsModifiers,
  type DateRange,
  type PropsBase,
} from 'react-day-picker';

import { CalendarView } from './Calendar';
import { useOxygenLocale } from './ConfigProvider';

/** Local calendar dates, constructed with new Date(year, monthIndex, day). */
export type DateRangeValue = [Date, Date];

export interface DateRangePreset {
  label: ReactNode;
  value: DateRangeValue;
}

export interface DateRangePickerProps extends Omit<PropsBase, 'mode' | 'required' | 'timeZone' | 'noonSafe'> {
  allowClear?: boolean;
  defaultValue?: DateRangeValue;
  /** Disabled dates also prevent ranges that cross them. */
  excludeDisabled?: boolean;
  max?: number;
  min?: number;
  onChange?: (value: DateRangeValue | undefined) => void;
  presets?: DateRangePreset[];
  value?: DateRangeValue;
}

export function DateRangePicker(allProps: DateRangePickerProps) {
  const {
    allowClear = true, className, defaultValue, excludeDisabled = true, max, min, onChange, presets = [],
    value: valueProp, ...props
  } = allProps;
  const controlled = 'value' in allProps;
  const locale = useOxygenLocale();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [draft, setDraft] = useState<DateRange>();
  const value = controlled ? valueProp : uncontrolledValue;
  const startTime = valueProp?.[0].getTime();
  const endTime = valueProp?.[1].getTime();

  useEffect(() => {
    setDraft(undefined);
  }, [startTime, endTime]);

  function commit(next: DateRangeValue | undefined) {
    setDraft(undefined);
    if (!controlled) setUncontrolledValue(next);
    onChange?.(next);
  }

  function normalizePreset(preset: DateRangePreset): DateRangeValue {
    return preset.value.map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())) as DateRangeValue;
  }

  function canSelectPreset(preset: DateRangePreset) {
    const [from, to] = normalizePreset(preset);
    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) return false;
    const days = new DateLib().differenceInCalendarDays(to, from);
    if ((min !== undefined && days < min) || (max !== undefined && max > 0 && days > max)) return false;
    const { disabled, startMonth, endMonth } = props;
    if (startMonth && from < new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)) return false;
    if (endMonth && to >= new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 1)) return false;
    if (disabled && (dateMatchModifiers(from, disabled) || dateMatchModifiers(to, disabled))) return false;
    return !(excludeDisabled && disabled && rangeContainsModifiers({ from, to }, disabled));
  }

  return (
    <div className="oxygen-date-range-picker">
      <CalendarView
        {...props}
        className={className}
        excludeDisabled={excludeDisabled}
        max={max}
        min={min}
        mode="range"
        onSelect={(next) => {
          if (next?.from && next.to) {
            commit([next.from, next.to]);
          } else {
            setDraft(next);
          }
        }}
        required
        resetOnSelect
        selected={draft ?? (value ? { from: value[0], to: value[1] } : undefined)}
      />
      {(allowClear || presets.length > 0) && (
        <div className="oxygen-date-range-picker__actions">
          {presets.map((preset, index) => (
            <button
              className="oxygen-date-range-picker__action"
              disabled={!canSelectPreset(preset)}
              key={index}
              onClick={() => { if (canSelectPreset(preset)) commit(normalizePreset(preset)); }}
              type="button"
            >{preset.label}</button>
          ))}
          {allowClear && (
            <button
              className="oxygen-date-range-picker__action"
              disabled={props.disabled === true || (!value && !draft)}
              onClick={() => commit(undefined)}
              type="button"
            >{locale.common.clear}</button>
          )}
        </div>
      )}
    </div>
  );
}
