import { TagInput } from '../src';

export const tagInputFormState = <TagInput aria-required="true" onChange={(value) => { const tokens: string[] = value; void tokens; }} value={['设计']} />;

// @ts-expect-error Token arrays are managed through value/onChange, not a named draft input.
export const namedTagInput = <TagInput name="tags" />;
// @ts-expect-error Native required validation would validate the draft rather than committed tokens.
export const requiredTagInput = <TagInput required />;
// @ts-expect-error TagInput does not serialize token arrays into a native form.
export const formTagInput = <TagInput form="project" />;
// @ts-expect-error Native submit attributes do not describe this token editor.
export const submitTagInput = <TagInput formAction="/submit" />;
