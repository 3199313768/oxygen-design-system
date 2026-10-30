import { expect, test, type Locator, type Page } from '@playwright/test';

async function setTokens(locator: Locator, tokens: Record<string, string>) {
  await locator.evaluate((node, values) => {
    for (const [key, value] of Object.entries(values)) (node as HTMLElement).style.setProperty(key, value);
  }, tokens);
}

async function motion(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      duration: style.transitionDuration, properties: style.transitionProperty,
      easing: style.transitionTimingFunction, animation: style.animationName,
      animationDuration: style.animationDuration, animationEasing: style.animationTimingFunction,
    };
  });
}

async function fontSamples(page: Page, expected: string) {
  const root = page.getByTestId('foundation-fonts');
  for (const locator of [root.getByRole('button'), root.getByRole('textbox'), root.getByTestId('foundation-font-body'), root.locator('.oxygen-page-header__title')]) {
    await expect(locator).toHaveCSS('font-family', expected);
  }
}

test('body font inherits the host and scoped overrides reach controls and patterns without affecting host text', async ({ page }) => {
  await page.goto('/');
  const host = page.getByTestId('foundation-host');
  const fonts = page.getByTestId('foundation-fonts');
  await fontSamples(page, 'serif');
  await host.evaluate((node) => { node.style.fontFamily = 'sans-serif'; });
  await fontSamples(page, 'sans-serif');
  await setTokens(fonts, { '--oxygen-font-family-body': 'monospace' });
  await fontSamples(page, 'monospace');
  await expect(page.getByTestId('foundation-host-text')).toHaveCSS('font-family', 'sans-serif');
  await expect(fonts.locator('code')).toHaveCSS('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace');
  await setTokens(fonts, { '--oxygen-font-family-mono': 'serif' });
  await expect(fonts.locator('code')).toHaveCSS('font-family', 'serif');
  await setTokens(fonts, { '--oxygen-font-family-body': 'var(--oxygen-font-family-system)' });
  for (const locator of [fonts.getByRole('button'), fonts.getByRole('textbox'), fonts.locator('.oxygen-page-header__title')]) {
    await expect(locator).toHaveCSS('font-family', /system-ui/);
  }
});

test('typography roles and control dimensions retain the established sizing', async ({ page }, testInfo) => {
  await page.goto('/');
  const fonts = page.getByTestId('foundation-fonts');
  for (const [level, size, height] of [[1, 28, 36], [2, 24, 32], [3, 20, 28], [4, 16, 24], [5, 14, 22]]) {
    const title = fonts.locator(`.oxygen-typography__title[data-level='${level}']`);
    await expect(title).toHaveCSS('font-size', `${size}px`);
    await expect(title).toHaveCSS('line-height', `${height}px`);
    await expect(title).toHaveCSS('font-weight', '600');
  }
  await expect(fonts.getByTestId('foundation-font-body')).toHaveCSS('font-size', '14px');
  await expect(fonts.getByTestId('foundation-font-body')).toHaveCSS('line-height', '22px');
  const controlHeight = testInfo.project.name === 'mobile-chromium' ? '44px' : '36px';
  await expect(fonts.getByRole('button')).toHaveCSS('height', controlHeight);
  await expect(fonts.getByRole('textbox')).toHaveCSS('height', controlHeight);
  await fonts.screenshot({ path: testInfo.outputPath('foundation-typography.png'), animations: 'disabled' });
});

test('semantic motion overrides apply and legacy base/fast tokens remain effective', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const root = page.getByTestId('foundation-motion');
  const button = page.getByTestId('foundation-motion-button');
  expect(await motion(button)).toMatchObject({ duration: '0.15s, 0.15s, 0.15s', properties: 'background-color, border-color, color', easing: 'ease, ease, ease' });
  expect(await motion(root.locator('.oxygen-spin__dot'))).toMatchObject({ animationDuration: '0.75s', animationEasing: 'linear' });
  expect(await motion(root.locator('.oxygen-skeleton'))).toMatchObject({ animationDuration: '1.2s', animationEasing: 'ease-in-out' });
  await setTokens(root, { '--oxygen-motion-base': '310ms' });
  expect((await motion(button)).duration).toBe('0.31s, 0.31s, 0.31s');
  await setTokens(root, {
    '--oxygen-motion-duration-interaction': '420ms', '--oxygen-motion-easing-standard': 'linear',
    '--oxygen-motion-duration-spin': '2s', '--oxygen-motion-duration-pulse': '3s',
  });
  expect(await motion(button)).toMatchObject({ duration: '0.42s, 0.42s, 0.42s', easing: 'linear, linear, linear' });
  expect((await motion(root.locator('.oxygen-switch__thumb'))).duration).toBe('0.42s');
  expect((await motion(root.locator('.oxygen-accordion__icon'))).duration).toBe('0.42s');
  expect((await motion(root.locator('.oxygen-spin__dot'))).animationDuration).toBe('2s');
  expect((await motion(root.locator('.oxygen-skeleton'))).animationDuration).toBe('3s');
  // Portals inherit document tokens; a scoped DOM variable alone cannot cross a portal.
  await setTokens(page.locator('html'), { '--oxygen-motion-base': '310ms', '--oxygen-motion-fast': '270ms' });
  await page.getByRole('button', { name: '打开动效对话框', exact: true }).click();
  expect(await motion(page.getByRole('dialog', { name: '动效对话框', exact: true }))).toMatchObject({ animationDuration: '0.31s', animationEasing: 'ease-out' });
  const exitState = await page.locator('.oxygen-overlay').evaluateHandle((node) => {
      const state: { duration: string | null } = { duration: null };
      const observer = new MutationObserver(() => {
        if (node.getAttribute('data-state') === 'closed') {
          observer.disconnect();
          state.duration = getComputedStyle(node).animationDuration;
        }
      });
      observer.observe(node, { attributes: true, attributeFilter: ['data-state'] });
      return state;
  });
  await page.keyboard.press('Escape');
  await expect.poll(() => exitState.evaluate((state) => state.duration)).toBe('0.27s');
  await exitState.dispose();
  await setTokens(page.locator('html'), { '--oxygen-motion-duration-panel': '630ms', '--oxygen-motion-easing-enter': 'linear' });
  await page.getByRole('button', { name: '打开动效抽屉', exact: true }).click();
  expect(await motion(page.getByRole('dialog', { name: '动效抽屉', exact: true }))).toMatchObject({ animationDuration: '0.63s', animationEasing: 'linear' });
});

test('reduced motion removes nonessential motion while controls, progress and dialog focus still work', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const root = page.getByTestId('foundation-motion');
  for (const selector of ['.oxygen-button', '.oxygen-switch', '.oxygen-switch__thumb', '.oxygen-progress__bar', '.oxygen-accordion__icon', '.oxygen-collapsible__icon', '.oxygen-navigation-menu__chevron']) {
    expect(await root.locator(selector).count(), selector).toBeGreaterThan(0);
    for (const node of await root.locator(selector).all()) expect((await motion(node)).duration, selector).toBe('0s');
  }
  for (const selector of ['.oxygen-button__loading-indicator', '.oxygen-spin__dot', '.oxygen-skeleton']) {
    expect((await motion(root.locator(selector))).animation, selector).toBe('none');
  }
  await root.getByRole('switch').click();
  await expect(root.getByRole('switch')).toBeChecked();
  await page.getByRole('button', { name: '更新动效进度', exact: true }).click();
  await expect(root.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  await expect(root.locator('.oxygen-progress__bar')).toHaveAttribute('style', 'width: 75%;');
  await page.getByRole('button', { name: '动效折叠项', exact: true }).click();
  await expect(root.getByText('展开内容仍然可读。', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '动效收起项', exact: true }).click();
  await expect(root.getByText('收起内容仍然可读。', { exact: true })).toBeVisible();
  const navigationTrigger = page.getByRole('button', { name: '动效导航', exact: true });
  await navigationTrigger.focus();
  await navigationTrigger.press('Enter');
  await expect(root.locator('.oxygen-navigation-menu__content')).toBeVisible();
  expect((await motion(root.locator('.oxygen-navigation-menu__content'))).animation).toBe('none');
  await page.keyboard.press('Escape');
  for (const [triggerName, selector] of [['打开动效对话框', '.oxygen-dialog'], ['打开动效气泡', '.oxygen-popover'], ['打开动效抽屉', '.oxygen-sheet']]) {
    const trigger = page.getByRole('button', { name: triggerName, exact: true });
    await trigger.click();
    const content = page.locator(selector);
    await expect(content).toBeVisible();
    expect((await motion(content)).animation, selector).toBe('none');
    if (selector !== '.oxygen-popover') expect((await motion(page.locator('.oxygen-overlay'))).animation).toBe('none');
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await expect(root.getByText('正在加载动效示例', { exact: true })).toBeVisible();
  await root.screenshot({ path: testInfo.outputPath('foundation-reduced-motion.png'), animations: 'disabled' });
});

test('ColorPicker exposes field state on its real editor and preserves confirm, cancel and keyboard focus', async ({ page }, testInfo) => {
  await page.goto('/');
  const fixture = page.getByTestId('foundation-color');
  const trigger = fixture.getByRole('button', { name: /^Foundation color #[0-9A-F]{6}$/i });
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).not.toHaveAttribute('aria-required');
  await expect(trigger).not.toHaveAttribute('aria-invalid');
  await expect(trigger).toHaveAttribute('data-invalid', 'true');
  await expect(trigger).toHaveAccessibleDescription(/Choose an approved brand color.*Required color/);
  await expect(fixture.getByRole('button', { name: /^Disabled foundation color #/ })).toBeDisabled();
  await expect(fixture.getByRole('button', { name: /^Loading foundation color #/ })).toBeDisabled();

  async function expectDescriptionsResolve(locator: Locator) {
    const ids = ((await locator.getAttribute('aria-describedby')) ?? '').split(/\s+/).filter(Boolean);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(await page.evaluate((value) => Boolean(document.getElementById(value)), id)).toBe(true);
  }

  await expectDescriptionsResolve(trigger);
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Foundation color', exact: true });
  const editor = dialog.getByRole('textbox', { name: 'Foundation color', exact: true });
  await expect(dialog).toBeVisible();
  await expect(editor).toBeFocused();
  await expect(editor).toHaveAttribute('aria-required', 'true');
  await expect(editor).toHaveAttribute('aria-invalid', 'true');
  await expect(editor).toHaveAccessibleDescription('Choose an approved brand color');
  await editor.fill('bad');
  await expect(editor).toHaveAccessibleDescription(/Choose an approved brand color.*Use six hex digits/);
  await expect(dialog.getByRole('button', { name: 'Apply color' })).toBeDisabled();
  await expectDescriptionsResolve(editor);
  await editor.fill('#abcdef');
  await expect(editor).toHaveAttribute('aria-invalid', 'true');
  await expect(editor).toHaveAccessibleDescription('Choose an approved brand color');
  await expectDescriptionsResolve(editor);
  await dialog.screenshot({ path: testInfo.outputPath('foundation-color-picker.png'), animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(fixture.getByTestId('foundation-color-committed')).toHaveText('#336699 / 0');
  await trigger.click();
  await editor.fill('#abcdef');
  await dialog.getByRole('button', { name: 'Apply color' }).click();
  await expect(trigger).toBeFocused();
  await expect(fixture.getByTestId('foundation-color-committed')).toHaveText('#ABCDEF / 1');
  await trigger.click();
  await editor.fill('#112233');
  await dialog.getByRole('button', { name: 'Cancel color' }).click();
  await expect(trigger).toBeFocused();
  await expect(fixture.getByTestId('foundation-color-committed')).toHaveText('#ABCDEF / 1');
  await expectDescriptionsResolve(trigger);
});
