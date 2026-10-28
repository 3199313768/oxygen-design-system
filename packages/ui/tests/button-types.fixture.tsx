import { createRef } from 'react';

import { Button } from '../src';

const anchorRef = createRef<HTMLAnchorElement>();
const elementRef: React.Ref<HTMLElement> = anchorRef;

export const asChildAnchorRefFixture = (
  <Button asChild ref={elementRef}>
    <a href="/example">查看详情</a>
  </Button>
);
