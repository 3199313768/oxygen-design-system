import { expect, test } from '@playwright/test';

const sections = ['组件介绍', '设计规范', 'API 参数', '基础示例', '不同状态', '交互示例', '使用限制', '可访问性说明'];

test('Button Docs edits the actual preview, copied source and resets interaction state', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/iframe.html?id=components-button--docs&viewMode=docs');
  for (const section of sections) await expect(page.getByRole('heading', { name: section, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy code', exact: true })).toHaveCount(0);
  const playground = page.getByTestId('playground').first();
  await playground.getByRole('button', { name: '保存', exact: true }).click();
  await expect(playground.getByText('操作次数：1', { exact: true })).toBeVisible();
  const row = page.locator('.docblock-argstable tr').filter({ has: page.getByText('children', { exact: true }) }).first();
  await row.locator('textarea,input[type="text"]').fill('更新标签');
  await expect(playground.getByRole('button', { name: '更新标签', exact: true })).toBeVisible();
  await expect(playground.getByTestId('playground-code')).toContainText('"children": "更新标签"');
  await playground.getByRole('button', { name: '复制代码', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('"children": "更新标签"');
  await playground.getByRole('button', { name: '恢复默认', exact: true }).click();
  await expect(playground.getByRole('button', { name: '保存', exact: true })).toBeVisible();
  await expect(playground.getByText('操作次数：0', { exact: true })).toBeVisible();
});

test('clipboard rejection leaves selectable code and announces fallback', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true }));
  await page.goto('/iframe.html?id=components-button--playground&viewMode=story');
  await page.getByRole('button', { name: '复制代码', exact: true }).click();
  await expect(page.getByText('复制失败，请选中下方代码手动复制。')).toBeVisible();
  await expect(page.getByTestId('playground-code')).toContainText('import { Button }');
});

test('reset restores authored defaults after opening a Props override link', async ({ page }) => {
  await page.goto('/iframe.html?id=components-button--playground&viewMode=story&args=children:Override;disabled:true');
  await expect(page.getByRole('button', { name: 'Override', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '恢复默认', exact: true }).click();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeEnabled();
  await expect(page.getByTestId('playground-code')).toContainText('"disabled": false');
  await page.goto('/iframe.html?id=components-button--state-1&viewMode=story&args=children:Override;disabled:false');
  await expect(page.getByRole('button', { name: 'Override', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: '恢复默认', exact: true }).click();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeDisabled();
});

// Exercise each authored entry through the published static artifact, not source grep.
import { readFileSync } from 'node:fs';
interface Definition {
  args: Record<string, string | number | boolean>;
  argTypes: Record<string, { control: { type: string }; options?: (string | number)[] }>;
}
const definitions = JSON.parse(readFileSync('apps/storybook/docs/playgrounds.json', 'utf8')) as Record<string, Definition>;

for (const [name, definition] of Object.entries(definitions)) {
  test(`${name}: complete Docs, editable preview/source and 390px layout`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.url().startsWith('http://127.0.0.1:') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`/iframe.html?id=components-${name.toLowerCase()}--docs&viewMode=docs`);
    for (const section of sections) await expect(page.getByRole('heading', { name: section, exact: true })).toBeVisible();
    const playground = page.getByTestId('playground').first();
    const code = playground.getByTestId('playground-code');
    const beforeCode = await code.textContent();
    const key = name === 'Tooltip' ? 'children' : Object.keys(definition.args)[0];
    async function previewSnapshot() {
      if (['Dialog', 'AlertDialog', 'Sheet'].includes(name)) {
        await playground.getByRole('button', { name: `打开${name}`, exact: true }).click();
        const dialog = page.getByRole(name === 'AlertDialog' ? 'alertdialog' : 'dialog');
        await expect(dialog).toBeVisible();
        const snapshot = await dialog.innerHTML();
        if (name === 'AlertDialog') await dialog.getByRole('button', { name: '取消', exact: true }).click();
        else await page.keyboard.press('Escape');
        return snapshot;
      }
      if (name === 'Popover') {
        await playground.getByRole('button', { name: '打开气泡', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: '补充信息' });
        await expect(dialog).toBeVisible();
        const snapshot = await dialog.evaluate((node) => node.outerHTML);
        await page.keyboard.press('Escape');
        return snapshot;
      }
      if (name === 'Tooltip') {
        const trigger = playground.getByRole('button', { name: '悬停或聚焦', exact: true });
        await trigger.hover();
        const tooltip = page.locator('.oxygen-tooltip').first();
        await expect(tooltip).toBeVisible();
        const snapshot = await tooltip.textContent();
        await page.keyboard.press('Escape');
        return snapshot;
      }
      if (['Toast', 'Message', 'Notification'].includes(name)) {
        await playground.getByRole('button', { name: '显示通知', exact: true }).click();
        await expect(page.locator('.oxygen-toast[data-state="open"]')).toBeVisible();
      }
      if (name === 'Accordion') {
        const overview = playground.getByRole('button', { name: '概览', exact: true });
        const details = playground.getByRole('button', { name: '详细信息', exact: true });
        for (const trigger of [overview, details]) {
          if (await trigger.getAttribute('aria-expanded') === 'true') await trigger.click();
        }
        await overview.click();
        await details.click();
      }
      return playground.locator('.oxygen-docs-preview').innerHTML();
    }
    const beforePreview = await previewSnapshot();
    const initial = definition.args[key];
    const config = definition.argTypes[key];
    const row = page.locator('.docblock-argstable tr').filter({ has: page.getByText(key, { exact: true }) }).first();
    await row.scrollIntoViewIfNeeded();
    if (config.control.type === 'select') {
      const next = config.options?.find((option) => option !== initial);
      await row.locator('select').selectOption({ label: String(next) });
    } else if (typeof initial === 'boolean') {
      await row.locator('label[for]').click();
      await expect(row.locator('input[type="checkbox"]')).toBeChecked({ checked: !initial });
    } else {
      await row.locator('textarea,input').fill(typeof initial === 'number' ? String(initial + 1) : `${initial} · 已调整`);
      await row.locator('textarea,input').press('Tab');
    }
    await expect(code).not.toHaveText(beforeCode ?? '');
    expect(await previewSnapshot(), `${name} parameter must change rendered component`).not.toEqual(beforePreview);
    await expect(playground.locator('.oxygen-docs-preview')).toBeVisible();
    await playground.getByRole('button', { name: '恢复默认', exact: true }).click();
    await expect(code).toHaveText(beforeCode ?? '');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('heading', { name: '组件介绍', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} page overflow`).toBe(true);
    if (['Button', 'Table', 'Dialog', 'ConfigProvider', 'AppShell'].includes(name)) {
      await page.screenshot({ path: testInfo.outputPath(`${name}-mobile.png`), fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test('complex examples preserve controlled input, selection and modal keyboard focus', async ({ page }) => {
  await page.goto('/iframe.html?id=components-input--playground&viewMode=story');
  await page.getByRole('textbox', { name: '示例输入', exact: true }).fill('保留输入');
  await expect(page.getByText('当前值：保留输入', { exact: true })).toBeVisible();
  await page.goto('/iframe.html?id=components-select--playground&viewMode=story');
  await page.getByRole('combobox', { name: '选择城市' }).click();
  await page.getByRole('option', { name: '上海', exact: true }).click();
  await expect(page.getByText('已选：shanghai', { exact: true })).toBeVisible();
  await page.goto('/iframe.html?id=components-dialog--playground&viewMode=story');
  const trigger = page.getByRole('button', { name: '打开Dialog' });
  await trigger.click();
  await page.getByRole('textbox', { name: '弹窗备注' }).fill('弹窗内容');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.goto('/iframe.html?id=components-table--playground&viewMode=story');
  await page.getByRole('checkbox', { name: '选择全部' }).check();
  await expect(page.getByText('已选 2 项', { exact: true })).toBeVisible();
  await page.goto('/iframe.html?id=components-upload--playground&viewMode=story');
  await page.locator('input[type=file]').setInputFiles({ name: 'example.txt', mimeType: 'text/plain', buffer: Buffer.from('example') });
  await expect(page.getByText('example.txt', { exact: true })).toBeVisible();
  await expect(page.locator('[data-status="done"]')).toBeVisible();
});

test('date input resets and color drafts validate, cancel and confirm', async ({ page }) => {
  await page.goto('/iframe.html?id=components-datepicker--playground&viewMode=story');
  const date = page.getByLabel('选择日期', { exact: true });
  await date.fill('2026-10-30');
  await expect(date).toHaveValue('2026-10-30');
  await page.getByRole('button', { name: '恢复默认', exact: true }).click();
  await expect(date).toHaveValue('');
  await page.goto('/iframe.html?id=components-colorpicker--playground&viewMode=story');
  const trigger = page.getByRole('button', { name: '主题色', exact: true });
  await trigger.click();
  const editor = page.getByRole('textbox', { name: '主题色', exact: true });
  await editor.fill('invalid');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: '确定', exact: true })).toBeDisabled();
  await editor.fill('#abcdef');
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByText('已确认颜色：#336699', { exact: true })).toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await editor.fill('#abcdef');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByText('已确认颜色：#ABCDEF', { exact: true })).toBeVisible();
});

test('public manager direct route, guide link and dark Docs render', async ({ page }, testInfo) => {
  await page.goto('/?path=/docs/components-button--docs&globals=oxygenTheme:dark');
  const docs = page.frameLocator('#storybook-preview-iframe');
  await expect(docs.getByRole('heading', { name: 'Button 按钮', exact: true })).toBeVisible();
  await expect(docs.locator('html')).toHaveAttribute('data-oxygen-theme', 'dark');
  const textColors = await docs.locator('.oxygen-component-docs h1, #component-section-1 p, #component-section-2 li').evaluateAll((nodes) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--oxygen-color-text)';
    document.body.append(probe);
    const expected = getComputedStyle(probe).color;
    probe.remove();
    return { actual: nodes.map((node) => getComputedStyle(node).color), expected };
  });
  for (const color of textColors.actual) expect(color).toBe(textColors.expected);
  await page.screenshot({ path: testInfo.outputPath('manager-dark-desktop.png'), fullPage: true });
  await page.reload();
  await expect(docs.getByRole('heading', { name: 'Button 按钮', exact: true })).toBeVisible();
  await docs.getByRole('link', { name: '设计与可访问性基础规范', exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('path')).toBe('/docs/基础规范-设计与可访问性--docs');
  await expect(docs.getByRole('heading', { level: 1, name: /设计与可访问性$/ })).toBeVisible();
});
