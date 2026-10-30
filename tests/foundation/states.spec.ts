import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import type { AxeResults } from 'axe-core';

const require = createRequire(`${process.cwd()}/package.json`);
type Args = Record<string, string | number | boolean>;
interface Definition { args: Args; states: Record<string, Args> }
interface StoryCase {
  component: string;
  state: string;
  storyId: string;
  source: string;
  exportName: string;
  args: Args;
}
const definitions = JSON.parse(readFileSync('apps/storybook/docs/playgrounds.json', 'utf8')) as Record<string, Definition>;
const stories: StoryCase[] = Object.entries(definitions).flatMap(([component, definition]) => [
  { component, state: '基础示例', storyId: `components-${component.toLowerCase()}--playground`, source: `apps/storybook/stories/components/${component}.stories.tsx`, exportName: 'Playground', args: definition.args },
  ...Object.entries(definition.states).map(([state, args], index) => ({
    component, state, storyId: `components-${component.toLowerCase()}--state-${index + 1}`,
    source: `apps/storybook/stories/components/${component}.stories.tsx`, exportName: `State${index + 1}`,
    args: { ...definition.args, ...args },
  })),
]);
const representative = new Set(['Button', 'Input', 'Table', 'Dialog', 'ConfigProvider']);
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus && !page.isClosed()) {
    try {
      await testInfo.attach('failure-current-mode.png', { body: await page.screenshot({ fullPage: true, animations: 'disabled' }), contentType: 'image/png' });
    } catch (error) {
      await testInfo.attach('failure-screenshot-error.txt', { body: String(error), contentType: 'text/plain' });
    }
  }
});

test('inventory covers all 67 components, 107 authored states and 174 built Storybook routes', async ({ request }, testInfo) => {
  expect(Object.keys(definitions)).toHaveLength(67);
  expect(stories.filter((story) => story.exportName !== 'Playground')).toHaveLength(107);
  expect(stories).toHaveLength(174);
  expect(new Set(stories.map((story) => story.storyId)).size).toBe(174);
  const response = await request.get('/index.json');
  expect(response.ok()).toBe(true);
  const index = await response.json() as { entries: Record<string, { id: string; type: string; exportName?: string }> };
  for (const story of stories) {
    const source = readFileSync(story.source, 'utf8');
    expect(source, story.source).toContain(`id: 'components-${story.component.toLowerCase()}'`);
    expect(source, story.source).toMatch(new RegExp(`export const ${story.exportName}: Story =`));
    if (story.exportName !== 'Playground') {
      expect(source, `${story.source} ${story.exportName} state mapping`).toContain(`name: ${JSON.stringify(story.state)}, args: ${JSON.stringify(definitions[story.component].states[story.state])}`);
    }
    expect(index.entries[story.storyId], story.storyId).toMatchObject({ id: story.storyId, type: 'story' });
    if (index.entries[story.storyId].exportName) expect(index.entries[story.storyId].exportName).toBe(story.exportName);
  }
  await testInfo.attach('foundation-state-inventory.json', {
    contentType: 'application/json',
    body: JSON.stringify({ components: 67, authoredStates: 107, stories: 174, themeCases: 348, cases: stories.flatMap((story) => ['light', 'dark'].map((theme) => ({ ...story, theme, test_id: `${story.storyId}/${theme}` }))) }, null, 2),
  });
});

async function reveal(component: string, preview: Locator, page: Page): Promise<string | undefined> {
  const triggerNames: Record<string, string> = {
    Dialog: '打开Dialog', AlertDialog: '打开AlertDialog', Sheet: '打开Sheet',
    Popover: '打开气泡', Toast: '显示通知', Message: '显示通知', Notification: '显示通知',
    DropdownMenu: '更多操作', NavigationMenu: '资源', ColorPicker: '主题色', Collapsible: '显示更多信息',
  };
  if (component === 'Tooltip') {
    await preview.getByRole('button', { name: '悬停或聚焦', exact: true }).hover();
    await expect(page.locator('.oxygen-tooltip').first()).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveCount(1);
    return 'tooltip-visible';
  }
  if (component === 'ImagePreview') {
    await preview.locator('.oxygen-image-preview__trigger').click();
    await expect(page.locator('.oxygen-image-preview__dialog')).toBeVisible();
    await expect(page.locator('.oxygen-image-preview__dialog')).toHaveAttribute('role', 'dialog');
    return 'image-preview-open';
  }
  if (component === 'Accordion') {
    const triggers = preview.locator('.oxygen-accordion__trigger:not(:disabled)');
    if (await triggers.count() === 0) return undefined;
    await triggers.first().click();
    await expect(triggers.first()).toHaveAttribute('aria-expanded', 'true');
    return 'accordion-expanded';
  }
  if (component === 'Tree') {
    const parent = preview.getByRole('treeitem', { name: '设计', exact: true });
    const child = preview.getByRole('treeitem', { name: '视觉', exact: true });
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await expect(child).toBeVisible();
    if (await parent.getAttribute('aria-disabled') === 'true') return undefined;
    await parent.focus();
    await parent.press('ArrowDown');
    await expect(child).toBeFocused();
    await child.press('ArrowLeft');
    await expect(parent).toBeFocused();
    await parent.press('ArrowLeft');
    await expect(parent).toHaveAttribute('aria-expanded', 'false');
    await parent.press('ArrowRight');
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await expect(child).toBeVisible();
    return 'tree-expanded';
  }
  if (['Select', 'Combobox', 'TreeSelect', 'Cascader'].includes(component)) {
    // Radix Select hides its trigger from AT while its modal listbox is open.
    const trigger = preview.getByRole('combobox', { includeHidden: true });
    if (await trigger.isDisabled()) return undefined;
    await trigger.focus();
    if (component === 'Select') await trigger.press('ArrowDown');
    else await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const optionContent: Record<string, [string, string]> = {
      Select: ['.oxygen-select__content', 'listbox'], Combobox: ['.oxygen-combobox__menu', 'listbox'],
      TreeSelect: ['.oxygen-hierarchy-select__popup', 'dialog'], Cascader: ['.oxygen-cascader__popup', 'dialog'],
    };
    const [selector, role] = optionContent[component];
    await expect(page.locator(selector)).toBeVisible();
    await expect(page.locator(selector)).toHaveAttribute('role', role);
    return 'options-open';
  }
  const name = triggerNames[component];
  if (!name) return undefined;
  const trigger = preview.getByRole('button', { name: component === 'ColorPicker' ? /^主题色 #[0-9A-F]{6}$/i : name, exact: component !== 'ColorPicker' });
  if (await trigger.isDisabled()) return undefined;
  if (component === 'NavigationMenu') {
    await trigger.focus();
    await trigger.press('Enter');
  } else await trigger.click();
  const contentSelector: Record<string, string> = {
    Dialog: '.oxygen-dialog', AlertDialog: '.oxygen-alert-dialog', Sheet: '.oxygen-sheet',
    Popover: '.oxygen-popover', Toast: '.oxygen-toast', Message: '.oxygen-toast', Notification: '.oxygen-toast',
    DropdownMenu: '.oxygen-menu__content', NavigationMenu: '.oxygen-navigation-menu__content',
    ColorPicker: '.oxygen-color-picker__popover', Collapsible: '.oxygen-collapsible__content',
  };
  await expect(page.locator(contentSelector[component]).first()).toBeVisible();
  if (component === 'NavigationMenu') {
    const link = page.locator(contentSelector[component]).getByRole('link').first();
    await trigger.press('Tab');
    await expect(link).toBeFocused();
    await link.press('Shift+Tab');
    await expect(trigger).toBeFocused();
    await trigger.press('Tab');
    await expect(link).toBeFocused();
  }
  const contentRoles: Record<string, string> = {
    Dialog: 'dialog', AlertDialog: 'alertdialog', Sheet: 'dialog', Popover: 'dialog',
    DropdownMenu: 'menu', ColorPicker: 'dialog',
  };
  if (contentRoles[component]) await expect(page.locator(contentSelector[component]).first()).toHaveAttribute('role', contentRoles[component]);
  return 'content-open';
}

async function scan(page: Page, phase: string, testInfo: TestInfo, component: string) {
  // Measure the settled surface, not an intermediate opacity during entry.
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return timing && timing.iterations !== Infinity && Number(timing.endTime) <= 1000;
    }).map((animation) => animation.finished.catch(() => undefined)));
  });
  // Scope includes the actual component example and currently visible portal content.
  // Storybook navigation, example source, copy/reset controls and Docs are outside this audit.
  const result = await page.evaluate(async ({ modalOpen }) => {
    for (const oldRoot of document.querySelectorAll('[data-oxygen-foundation-scan-root]')) oldRoot.removeAttribute('data-oxygen-foundation-scan-root');
    const preview = document.querySelector('.oxygen-docs-preview')!;
    const portals = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], [role="tooltip"], [role="menu"], [role="listbox"], .oxygen-toast, .oxygen-dialog, .oxygen-alert-dialog, .oxygen-sheet, .oxygen-popover, .oxygen-tooltip, .oxygen-menu__content, .oxygen-select__content, .oxygen-color-picker__popover, .oxygen-image-preview__dialog')]
      .filter((node) => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden');
    for (const node of portals) node.setAttribute('data-oxygen-foundation-scan-root', '');
    // Modal background is intentionally hidden from assistive technology and
    // focus-trapped; its initial visible state was scanned before opening.
    const previewHidden = Boolean(preview.closest('[aria-hidden="true"], [inert]'));
    const include = [...(!previewHidden && !modalOpen ? ['.oxygen-docs-preview'] : []), ...(portals.length ? ['[data-oxygen-foundation-scan-root]'] : [])];
    if (!include.length) throw new Error('No active component content to scan');
    const axe = (window as unknown as { oxygenFoundationAxe: typeof import('axe-core') }).oxygenFoundationAxe;
    const axeResult = await axe.run({ include }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return { axeResult, include, portalCount: portals.length };
  }, { modalOpen: phase !== 'initial' && ['Dialog', 'AlertDialog', 'Sheet', 'DropdownMenu', 'ImagePreview', 'Select'].includes(component) });
  await testInfo.attach(`${phase}-axe-violations.json`, { contentType: 'application/json', body: JSON.stringify(result.axeResult.violations, null, 2) });
  await testInfo.attach(`${phase}-axe-incomplete.json`, { contentType: 'application/json', body: JSON.stringify(result.axeResult.incomplete, null, 2) });
  return { phase, scope: result.include, portalCount: result.portalCount, ...result.axeResult };
}

async function reviewedToolFinding(page: Page, component: string, finding: AxeResults['violations'][number]) {
  if (!((component === 'NavigationMenu' && finding.id === 'aria-hidden-focus') ||
    (component === 'Tree' && finding.id === 'label-content-name-mismatch'))) return undefined;
  // Preserve the raw finding. Only recognize exact, verified primitive patterns;
  // all other nodes/rules still fail. These cases remain in the manual queue.
  const recognized = await page.evaluate(({ component, targets }) => targets.every((target) => {
    if (target.length !== 1 || typeof target[0] !== 'string') return false;
    const node = document.querySelector(target[0]);
    if (!node) return false;
    if (component === 'NavigationMenu') return node.tagName === 'SPAN' &&
      node.getAttribute('aria-hidden') === 'true' && node.getAttribute('tabindex') === '0' &&
      !node.textContent && node.children.length === 0 &&
      node.previousElementSibling?.matches('.oxygen-navigation-menu__trigger') === true &&
      node.getBoundingClientRect().width <= 1 && node.getBoundingClientRect().height <= 1;
    const label = document.getElementById(node.getAttribute('aria-labelledby') ?? '');
    const row = node.querySelector(':scope > .oxygen-tree__row');
    return node.matches('.oxygen-tree__item[role="treeitem"]') &&
      node.getAttribute('aria-expanded') === 'true' &&
      node.querySelector(':scope > ul[role="group"]') !== null &&
      label?.matches('.oxygen-tree__label') === true &&
      row !== null && label.parentElement === row && row.textContent?.trim() === label.textContent?.trim() &&
      label.closest('[role="treeitem"]') === node && Boolean(label.textContent?.trim());
  }), { component, targets: finding.nodes.map((node) => node.target) });
  if (!recognized) return undefined;
  return component === 'NavigationMenu'
    ? 'Radix empty focus proxy forwards immediately to visible content; this case asserts Tab / Shift+Tab destinations. React delegated onFocus is invisible to the axe heuristic. Manual assistive technology review remains required.'
    : 'The parent treeitem is named by its own visible label and owns a nested group of separately named child items (W3C APG tree pattern). Axe counts nested child text against the parent label. Manual assistive technology review remains required.';
}

for (const story of stories) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${story.component} / ${story.state} / ${theme}`, async ({ page }, testInfo) => {
      const testId = `${story.storyId}/${theme}`;
      const runtimeErrors: string[] = [];
      const consoleErrors: string[] = [];
      const resourceErrors: string[] = [];
      let executionError: string | undefined;
      const scans: (AxeResults & { phase: string; scope: string[]; portalCount: number })[] = [];
      const layouts: { phase: string; width: number; scrollWidth: number; overflow: boolean }[] = [];
      testInfo.annotations.push({ type: 'test_id', description: testId });
      page.on('pageerror', (error) => runtimeErrors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('response', (response) => {
        if (new URL(response.url()).origin === new URL(testInfo.project.use.baseURL!).origin && response.status() >= 400) resourceErrors.push(`${response.status()} ${response.url()}`);
      });
      async function inspect(phase: string) {
        scans.push(await scan(page, phase, testInfo, story.component));
        layouts.push(await page.evaluate((label) => ({ phase: label, width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }), phase));
        if (representative.has(story.component)) {
          const filename = `${story.storyId}-${theme}-${phase}.png`;
          const path = testInfo.outputPath(filename);
          await page.screenshot({ path, fullPage: true, animations: 'disabled' });
          await testInfo.attach(filename, { path, contentType: 'image/png' });
        }
      }
      try {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(`/iframe.html?id=${story.storyId}&viewMode=story&globals=oxygenTheme:${theme}`);
        const preview = page.locator('.oxygen-docs-preview');
        await expect(preview).toBeVisible();
        await expect(preview.locator(':scope > *').first()).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('data-oxygen-theme', theme);
        // Load the scanner before opening timed notifications; never freeze their behavior.
        // Keep an independent instance: Storybook's addon may run its own axe
        // concurrently, and restoring its global avoids interfering with it.
        await page.addScriptTag({ content: `(() => { const original = window.axe; ${axeSource}\nwindow.oxygenFoundationAxe = window.axe; window.axe = original; })();` });
        await inspect('initial');
        const opened = await reveal(story.component, preview, page);
        if (opened) await inspect(opened);
      } catch (error) {
        executionError = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        const incomplete = scans.flatMap((entry) => entry.incomplete.map((finding) => ({ phase: entry.phase, finding })));
        const allViolations = scans.flatMap((entry) => entry.violations.map((finding) => ({ phase: entry.phase, finding })));
        const reviewed = [];
        const violations = [];
        for (const entry of allViolations) {
          const reason = await reviewedToolFinding(page, story.component, entry.finding);
          if (reason) reviewed.push({ ...entry, reason });
          else violations.push(entry);
        }
        if (incomplete.length || reviewed.length) testInfo.annotations.push({ type: 'manual-review-required', description: `${incomplete.length} incomplete and ${reviewed.length} reviewed tool findings; manual acceptance remains unresolved.` });
        await testInfo.attach('state-acceptance.json', {
          contentType: 'application/json',
          body: JSON.stringify({
            test_id: testId, ...story, theme, tags: wcagTags,
            status: executionError || violations.length || runtimeErrors.length || consoleErrors.length || resourceErrors.length || layouts.some((entry) => entry.overflow) ? 'failed'
              : incomplete.length || reviewed.length ? 'manual-review-required' : scans.length ? 'automated-checks-clear' : 'render-not-complete',
            boundary: 'Component preview and visible portal content only. Native platform controls, physical devices and manual assistive technology acceptance remain unverified.',
            themeBoundaries: await page.locator('[data-oxygen-theme]').evaluateAll((nodes) => nodes.map((node) => ({ tag: node.tagName, theme: node.getAttribute('data-oxygen-theme') }))),
            executionError, runtimeErrors, consoleErrors, resourceErrors, layouts, reviewedToolFindings: reviewed,
            scans: scans.map((entry) => ({ phase: entry.phase, scope: entry.scope, portalCount: entry.portalCount, engine: entry.testEngine, violations: entry.violations, incomplete: entry.incomplete, passes: entry.passes.length, inapplicable: entry.inapplicable.length })),
          }, null, 2),
        });
        expect.soft(runtimeErrors, `${testId} runtime errors`).toEqual([]);
        expect.soft(consoleErrors, `${testId} console errors`).toEqual([]);
        expect.soft(resourceErrors, `${testId} local resource errors`).toEqual([]);
        expect.soft(layouts.filter((entry) => entry.overflow), `${testId} page overflow`).toEqual([]);
        expect.soft(violations, `${testId} WCAG violations`).toEqual([]);
        // Incomplete findings are preserved as manual-review-required in the
        // evidence. They do not assert a violation and cannot prove acceptance.
      }
    });
  }
}
