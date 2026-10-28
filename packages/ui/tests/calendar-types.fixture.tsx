import { Calendar, DateRangePicker } from '../src';

<Calendar value={new Date(2026, 9, 28)} onChange={(date) => date?.getDate()} />;
<Calendar selected={new Date(2026, 9, 28)} onSelect={(date) => date?.getDate()} />;
<DateRangePicker onChange={(range) => range?.[0].getDate()} />;
// @ts-expect-error Calendar has a fixed single-selection mode.
<Calendar mode="range" />;
// @ts-expect-error Calendar permits clearing its single selection.
<Calendar required />;
// @ts-expect-error DateRangePicker has a fixed range-selection mode.
<DateRangePicker mode="single" />;
// @ts-expect-error DateRangePicker owns completion and clearing behavior.
<DateRangePicker required />;
// @ts-expect-error Public dates use the local calendar timezone.
<Calendar timeZone="UTC" />;
