import { createRef } from 'react';
import { Combobox } from '../src/components/Combobox';

const options = [{ label: 'One', value: 1 }];
export const numericCombobox = <Combobox options={options} value={1} ref={createRef<HTMLInputElement>()} onChange={(value, option) => { const selected: number | undefined = value; const optionValue: number | undefined = option?.value; void selected; void optionValue; }} />;
// @ts-expect-error Value must match the option value type.
export const invalidCombobox = <Combobox options={options} value="wrong" />;
