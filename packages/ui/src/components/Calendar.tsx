import { useState } from 'react';
import { DayPicker, type DayPickerProps, type PropsBase } from 'react-day-picker';
import { zhCN } from 'react-day-picker/locale';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';

export interface CalendarProps extends Omit<PropsBase, 'mode' | 'required' | 'timeZone' | 'noonSafe'> {
  /** A local calendar date, constructed with new Date(year, monthIndex, day). */
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  /** @deprecated Use defaultValue. */
  defaultSelected?: Date;
  /** @deprecated Use onChange. */
  onSelect?: (date: Date | undefined) => void;
  /** @deprecated Use value. */
  selected?: Date;
}

// Shared presentation keeps single-day and range calendars visually consistent.
export function CalendarView({ className, labels, locale, ...props }: DayPickerProps) {
  const oxygenLocale = useOxygenLocale();
  return (
    <DayPicker
      {...props}
      className={cn('oxygen-calendar', className)}
      labels={{ ...oxygenLocale.calendar.labels, ...labels }}
      locale={locale ?? oxygenLocale.calendar.locale ?? zhCN}
    />
  );
}

export function Calendar(allProps: CalendarProps) {
  const { defaultSelected, defaultValue, onChange, onSelect, selected, value, ...props } = allProps;
  const [uncontrolledSelected, setUncontrolledSelected] = useState(
    'defaultValue' in allProps ? defaultValue : defaultSelected,
  );
  const controlled = 'value' in allProps || 'selected' in allProps;

  return (
    <CalendarView
      {...props}
      mode="single"
      onSelect={(next) => {
        if (!controlled) setUncontrolledSelected(next);
        onChange?.(next);
        onSelect?.(next);
      }}
      selected={controlled ? ('value' in allProps ? value : selected) : uncontrolledSelected}
    />
  );
}
