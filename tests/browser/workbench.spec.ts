import { expect, test as base } from '@playwright/test';

const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await use();
    expect(errors, 'page runtime errors').toEqual([]);
  }, { auto: true }],
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('filtering resets pagination and empty results can be reset', async ({ page }) => {
  await expect(page.getByRole('table', { name: '记录列表' })).toBeVisible();
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 06' })).toBeVisible();
  await page.getByRole('textbox', { name: '关键词' }).fill('12');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 12' })).toBeVisible();
  await expect(page.getByRole('button', { name: '上一页', exact: true })).toBeDisabled();
  await page.getByRole('textbox', { name: '关键词' }).fill('不存在的记录');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.getByRole('heading', { name: '没有匹配记录' })).toBeVisible();
  await page.getByRole('button', { name: '清除筛选', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 01' })).toBeVisible();
  await page.getByRole('combobox', { name: '状态筛选' }).click();
  await page.getByRole('option', { name: '已停用', exact: true }).click();
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 02' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 01' })).toHaveCount(0);
});

test('editing validates, cancels drafts, and retains saved values when reopened', async ({ page }) => {
  const edit = page.getByRole('button', { name: '编辑 演示记录 01', exact: true });
  await edit.click();
  const dialog = page.getByRole('dialog', { name: '编辑记录' });
  const name = dialog.getByRole('textbox', { name: '名称', exact: true });
  await name.fill('   ');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByText('请输入名称')).toBeVisible();
  await name.fill('未保存草稿');
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await expect(edit).toBeFocused();
  await edit.click();
  await expect(name).toHaveValue('演示记录 01');
  await name.fill('  已更新记录  ');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const updated = page.getByRole('button', { name: '编辑 已更新记录', exact: true });
  await updated.click();
  await expect(name).toHaveValue('已更新记录');
  await page.keyboard.press('Escape');
  await expect(updated).toBeFocused();
});

test('uploads block saving until complete and saved attachment metadata reopens', async ({ page }) => {
  await page.getByRole('button', { name: '编辑 演示记录 01', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('选择附件').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('sample') });
  await expect(dialog.getByRole('button', { name: '保存', exact: true })).toBeDisabled();
  await expect(dialog.getByText('已完成', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 01' })).toContainText('notes.txt');
  await page.getByRole('button', { name: '编辑 演示记录 01', exact: true }).click();
  await expect(dialog.getByText('notes.txt', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '移除 notes.txt', exact: true }).click();
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 01' })).not.toContainText('notes.txt');
});

test('upload failure can be removed and closing an upload discards its draft', async ({ page }) => {
  const edit = page.getByRole('button', { name: '编辑 演示记录 01', exact: true });
  await edit.click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('checkbox', { name: '模拟上传失败' }).check();
  await dialog.getByLabel('选择附件').setInputFiles({ name: 'failed.txt', mimeType: 'text/plain', buffer: Buffer.from('sample') });
  await expect(dialog.getByText('上传失败', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: '保存', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: '移除 failed.txt', exact: true }).click();
  await dialog.getByRole('checkbox', { name: '模拟上传失败' }).uncheck();
  await dialog.getByLabel('选择附件').setInputFiles({ name: 'cancelled.txt', mimeType: 'text/plain', buffer: Buffer.from('sample') });
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await edit.click();
  await expect(dialog.getByText('cancelled.txt', { exact: true })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: '保存', exact: true })).toBeEnabled();
  await expect(dialog.getByRole('checkbox', { name: '模拟上传失败' })).not.toBeChecked();
});

test('page and dialog fit the viewport and keyboard focus stays inside the dialog', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { name: '记录管理', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('page.png'), fullPage: true });
  await page.getByRole('button', { name: '编辑 演示记录 01', exact: true }).click();
  const dialog = page.getByRole('dialog');
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    await expect(dialog).toContainText('编辑记录');
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  }
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.screenshot({ path: testInfo.outputPath('dialog.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('changing page size resets to the first page and renders the requested rows', async ({ page }) => {
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await page.getByLabel('每页条数', { exact: true }).selectOption('10');
  await expect(page.getByRole('button', { name: '上一页', exact: true })).toBeDisabled();
  await expect(page.getByRole('row')).toHaveCount(11);
  await expect(page.getByRole('row').filter({ hasText: '演示记录 10' })).toBeVisible();
});

test('editing a record out of the active filter restores focus to search', async ({ page }) => {
  const search = page.getByRole('textbox', { name: '关键词' });
  await search.fill('01');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await page.getByRole('button', { name: '编辑 演示记录 01', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: '名称', exact: true }).fill('改名后的记录');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(search).toBeFocused();
  await expect(page.getByRole('heading', { name: '没有匹配记录' })).toBeVisible();
  await page.getByRole('button', { name: '清除筛选', exact: true }).click();
  await expect(page.getByRole('button', { name: '编辑 改名后的记录', exact: true })).toBeVisible();
});

test('invalid attachments show an error and are not added to the upload list', async ({ page }) => {
  await page.getByRole('button', { name: '编辑 演示记录 01', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const input = dialog.getByLabel('选择附件');
  await input.setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: Buffer.from('image') });
  await expect(dialog.getByRole('alert')).toContainText('请选择 1 MB 以内的 .txt 文件');
  await expect(dialog.getByText('image.png', { exact: true })).toHaveCount(0);
  await input.setInputFiles({ name: 'large.txt', mimeType: 'text/plain', buffer: Buffer.alloc(1024 * 1024 + 1) });
  await expect(dialog.getByRole('alert')).toContainText('请选择 1 MB 以内的 .txt 文件');
  await expect(dialog.getByText('large.txt', { exact: true })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: '保存', exact: true })).toBeEnabled();
});
