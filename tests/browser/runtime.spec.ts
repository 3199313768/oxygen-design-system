import { expect, test } from '@playwright/test';

test('production consumer loads its assets without runtime errors and filters with the keyboard', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('requestfailed', (request) => failures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  await expect(page.getByRole('table', { name: '记录列表' })).toBeVisible();
  const filter = page.getByRole('combobox', { name: '状态筛选' });
  await filter.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('option', { name: '全部状态' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('option', { name: '已停用', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(filter).toContainText('已停用');
  await expect(filter).toBeFocused();
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 02' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: '演示记录 01' })).toHaveCount(0);
  expect(failures).toEqual([]);
});
