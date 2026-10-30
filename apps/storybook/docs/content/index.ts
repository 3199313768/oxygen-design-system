import type { ComponentDoc } from '../types';
import { generalDocs } from './general';
import { layoutDocs } from './layout';
import { navigationDocs } from './navigation';
import { formsDocs } from './forms';
import { datesDocs } from './dates';
import { displayDocs } from './display';
import { feedbackDocs } from './feedback';
import { otherDocs } from './other';
import { patternsDocs } from './patterns';

export const componentDocs: ComponentDoc[] = [
  ...generalDocs,
  ...layoutDocs,
  ...navigationDocs,
  ...formsDocs,
  ...datesDocs,
  ...displayDocs,
  ...feedbackDocs,
  ...otherDocs,
  ...patternsDocs,
];
