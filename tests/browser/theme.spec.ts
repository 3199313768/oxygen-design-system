import { expect, test, type Locator } from '@playwright/test';

// Canvas resolves modern color syntax to actual sRGB pixels in each browser.
async function surface(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    context.fillStyle = style.backgroundColor;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data;
    return { brightness: (r + g + b) / (3 * 255), alpha, scheme: style.colorScheme };
  });
}

async function expectSurface(locator: Locator, mode: 'light' | 'dark') {
  await expect.poll(async () => {
    const actual = await surface(locator);
    return actual.alpha === 255 && (mode === 'light' ? actual.brightness > 0.8 : actual.brightness < 0.3);
  }).toBe(true);
  const actual = await surface(locator);
  expect(actual.alpha).toBe(255);
  if (mode === 'light') expect(actual.brightness).toBeGreaterThan(0.8);
  else expect(actual.brightness).toBeLessThan(0.3);
  expect(actual.scheme).toContain(mode);
}

async function colors(locator: Locator, placeholder = false) {
  return locator.evaluate((node, usePlaceholder) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    function rgba(color: string) {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data).map((value) => value / 255);
    }
    function composite(top: number[], bottom: number[]) {
      return top.slice(0, 3).map((channel, index) => channel * top[3] + bottom[index] * (1 - top[3]));
    }
    function luminance(rgb: number[]) {
      const linear = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    }
    const ancestors: Element[] = [];
    for (let current: Element | null = node; current; current = current.parentElement) ancestors.unshift(current);
    let background = [1, 1, 1];
    for (const ancestor of ancestors) background = composite(rgba(getComputedStyle(ancestor).backgroundColor), background);
    const style = getComputedStyle(node, usePlaceholder ? '::placeholder' : null);
    const text = rgba(style.color);
    if (usePlaceholder) text[3] *= Number(style.opacity);
    const foreground = composite(text, background);
    const foregroundLuminance = luminance(foreground);
    const backgroundLuminance = luminance(background);
    return {
      contrast: (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05),
      backgroundLuminance,
    };
  }, placeholder);
}

for (const pageMode of ['light', 'dark'] as const) {
  test(`${pageMode} page local tooltip preserves theme and actual text contrast`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('combobox', { name: '页面主题', exact: true }).selectOption(pageMode);
    const trigger = page.getByRole('button', { name: '局部提示', exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await expect(trigger).toBeInViewport();
    await trigger.hover();
    const tooltip = page.locator('.oxygen-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveAttribute('data-oxygen-theme', pageMode === 'dark' ? 'light' : 'dark');
    await expect.poll(async () => (await colors(tooltip)).contrast, { message: 'tooltip actual foreground/background contrast' }).toBeGreaterThanOrEqual(4.5);
  });

  test(`${pageMode} text colors meet contrast on actual component surfaces`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('combobox', { name: '页面主题', exact: true }).selectOption(pageMode);
    const input = page.getByRole('textbox', { name: '关键词', exact: true });
    await input.fill('输入内容');
    const samples = [
      { name: 'primary button', locator: page.getByRole('button', { name: '查询', exact: true }) },
      { name: 'input text', locator: input },
      { name: 'success badge', locator: page.locator('.oxygen-badge').filter({ hasText: '启用中' }).first() },
      { name: 'table heading', locator: page.getByRole('columnheader', { name: '名称', exact: true }) },
      { name: 'table body', locator: page.getByRole('cell', { name: '演示记录 01', exact: true }) },
    ];
    for (const sample of samples) {
      await expect(sample.locator).toBeVisible();
      await expect.poll(async () => (await colors(sample.locator)).contrast, { message: `${sample.name} actual color contrast` }).toBeGreaterThanOrEqual(4.5);
    }
    await input.clear();
    await expect.poll(async () => (await colors(input, true)).contrast, { message: 'placeholder actual color contrast' }).toBeGreaterThanOrEqual(4.5);
  });
}

test('dark surfaces have increasing elevation from page to panel to dialog', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: '页面主题', exact: true }).selectOption('dark');
  const background = (await colors(page.locator('body'))).backgroundLuminance;
  const panel = (await colors(page.getByRole('region', { name: '筛选记录' }))).backgroundLuminance;
  expect(panel, 'panel is lighter than the page background').toBeGreaterThan(background);
  await page.getByRole('button', { name: '编辑 演示记录 01', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '编辑记录' });
  await expect(dialog).toBeVisible();
  const popup = (await colors(dialog)).backgroundLuminance;
  expect(popup, 'dialog is lighter than the panel').toBeGreaterThan(panel);
});

test('default is light under a dark OS; explicit modes stay stable and system changes live', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const host = page.getByRole('combobox', { name: '页面主题', exact: true });
  const body = page.locator('body');
  await expect(host).toHaveValue('light');
  await expectSurface(body, 'light');
  await host.selectOption('system');
  await expectSurface(body, 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expectSurface(body, 'light');
  await host.selectOption('dark');
  await expectSurface(body, 'dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expectSurface(body, 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expectSurface(body, 'dark');
  await host.selectOption('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expectSurface(body, 'light');
  await expect(host).toHaveCSS('color-scheme', 'light');
});

for (const mode of ['light', 'dark'] as const) {
  test(`${mode} page keeps opposite local themes and body-mounted portals`, async ({ page }, testInfo) => {
    await page.goto('/');
    await page.getByRole('combobox', { name: '页面主题', exact: true }).selectOption(mode);
    const localMode = mode === 'dark' ? 'light' : 'dark';
    const region = page.getByRole('region', { name: '局部主题示例' });
    await expectSurface(region, localMode);
    await expect(region.getByRole('textbox', { name: '继承主题备注' })).toHaveCSS('color-scheme', localMode);
    const media = region.getByRole('img');
    expect(await media.evaluate((node) => {
      for (let current: Element | null = node; current; current = current.parentElement) {
        if (getComputedStyle(current).filter !== 'none') return false;
      }
      return true;
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${mode}-page.png`), fullPage: true, animations: 'disabled' });
    await region.getByRole('combobox', { name: '局部工作空间' }).click();
    const listbox = page.getByRole('listbox');
    await expectSurface(listbox, localMode);
    expect(await listbox.evaluate((node) => node.closest('main') === null)).toBe(true);
    await page.getByRole('option', { name: '研发工作空间' }).click();
    await region.getByRole('button', { name: '局部主题说明' }).click();
    const popover = page.getByRole('dialog', { name: '局部主题气泡' });
    await expectSurface(popover, localMode);
    expect(await popover.evaluate((node) => node.closest('main') === null)).toBe(true);
    await page.keyboard.press('Escape');
    await region.getByRole('button', { name: '打开局部对话框' }).click();
    const dialog = page.getByRole('dialog', { name: '局部主题对话框' });
    await expectSurface(dialog, localMode);
    expect(await dialog.evaluate((node) => node.closest('main') === null)).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-oxygen-theme', mode);
    await page.screenshot({ path: testInfo.outputPath(`${mode}-local-dialog.png`), fullPage: true, animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(region.getByRole('button', { name: '打开局部对话框' })).toBeFocused();
  });
}

test('host theme changes preserve an open record dialog, input node, value and focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '编辑 演示记录 01', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '编辑记录' });
  const input = dialog.getByRole('textbox', { name: '名称', exact: true });
  await input.fill('保留主题切换草稿');
  const original = await input.elementHandle();
  for (const mode of ['dark', 'light'] as const) {
    // A modal intentionally makes the host selector inert. Dispatch the host's
    // real change event without moving focus out of the still-open modal.
    await page.locator('.workbench-theme-picker select').evaluate((node, value) => {
      (node as HTMLSelectElement).value = value;
      node.dispatchEvent(new Event('change', { bubbles: true }));
    }, mode);
    await expect(page.locator('html')).toHaveAttribute('data-oxygen-theme', mode);
    await expect(dialog).toBeVisible();
    await expectSurface(dialog, mode);
    await expect(input).toHaveValue('保留主题切换草稿');
    await expect(input).toBeFocused();
    expect(await original!.evaluate((node) => node === document.activeElement)).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
