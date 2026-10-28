# Calendar and DateRangePicker

Both components use **local calendar dates**. Construct 28 October 2026 with `new Date(2026, 9, 28)` (month indexes start at zero). Selected dates and preset results use local midnight. `new Date('2026-10-28')` parses UTC midnight and is not the date-only convention for these components. `timeZone` and `noonSafe` are deliberately excluded from the public props.

Use local `getFullYear()`, `getMonth()` and `getDate()` to serialize a date-only API field. Do not serialize through `toISOString().slice(0, 10)`: in Asia/Shanghai, local 28 October midnight is `2026-10-27T16:00:00.000Z`. To parse a date-only string, split its year/month/day fields and construct `new Date(year, month - 1, day)`.

```tsx
const [day, setDay] = useState<Date>();
const [range, setRange] = useState<DateRangeValue>();

<Calendar value={day} onChange={setDay} />;
<DateRangePicker
  value={range}
  onChange={setRange}
  presets={[
    { label: 'October working week', value: [new Date(2026, 9, 26), new Date(2026, 9, 30)] },
  ]}
/>;
```

`Calendar` supports `value`, `defaultValue` and `onChange`. The compatibility aliases `selected`, `defaultSelected` and `onSelect` still work; canonical value props take precedence. If both callbacks are provided, both receive the selection. Clicking the selected day clears the optional single selection.

`DateRangePicker` accepts `value`/`defaultValue` as `[Date, Date]`. The first endpoint stays an internal draft. `onChange` receives a completed tuple only after both endpoints are selected, or `undefined` when the clear button is used. Clearing also discards an unfinished draft. Set `allowClear={false}` to hide this action. Controlled values remain owned by the parent until it accepts the change.

`presets` accepts `{ label: ReactNode, value: [Date, Date] }[]`. Preset values are normalized to local midnight. Invalid or reversed ranges, disabled endpoints, excluded disabled crossings, ranges outside `startMonth`/`endMonth`, and ranges violating `min`/`max` are unavailable. Range lengths use calendar-day differences, as in react-day-picker (a same-day range has length zero). `excludeDisabled` defaults to true; setting it false permits disabled days inside a range but never at its endpoints. `disabled={true}` disables the calendar, presets and clear action.

The default calendar locale is react-day-picker's `zhCN`. Pass its `locale` prop (for example `enUS`) to localize dates, navigation and selected/today announcements. Defaults can also be set through `ConfigProvider`'s `locale.calendar.locale` and `locale.calendar.labels`. Per-component locale/label overrides take precedence over those defaults. Custom label functions own their text and should preserve the selected/today information needed by their audience. The clear label uses `ConfigProvider`'s `locale.common.clear`.

Selection modes are fixed: Calendar is single-date, DateRangePicker is range. Their public interfaces omit `mode` and `required` rather than silently accepting ineffective props.
