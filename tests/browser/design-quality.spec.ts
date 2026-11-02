import { expect, test, type Locator } from '@playwright/test';

async function expectInside(inner: Locator, outer: Locator) {
  const child = await inner.boundingBox();
  const parent = await outer.boundingBox();
  expect(child).not.toBeNull();
  expect(parent).not.toBeNull();
  expect(child!.x).toBeGreaterThanOrEqual(parent!.x);
  expect(child!.y).toBeGreaterThanOrEqual(parent!.y);
  expect(child!.x + child!.width).toBeLessThanOrEqual(parent!.x + parent!.width + 1);
  expect(child!.y + child!.height).toBeLessThanOrEqual(parent!.y + parent!.height + 1);
}

for (const theme of ['light', 'dark']) {
  test.describe(`design quality / ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.getByRole('combobox', { name: '页面主题', exact: true }).selectOption(theme);
    });

    test('shared navigation viewport contains visible focused content and tracks content changes', async ({ page }) => {
      const navigation = page.getByRole('navigation', { name: '共享视口导航', exact: true });
      const trigger = navigation.getByRole('button', { name: '共享资源', exact: true });
      await trigger.focus();
      await trigger.press('Enter');
      const link = navigation.getByRole('link', { name: '共享使用指南', exact: true });
      const viewport = navigation.locator('.oxygen-navigation-menu__viewport');
      await expect(link).toBeVisible();
      await expect.poll(async () => (await viewport.boundingBox())?.height ?? 0).toBeGreaterThan(38);
      await trigger.press('ArrowDown');
      await expect(link).toBeFocused();
      await expectInside(link, viewport);
      await link.press('Escape');
      const other = navigation.getByRole('button', { name: '更多共享资源', exact: true });
      await other.focus();
      await other.press('Enter');
      const second = navigation.getByRole('link', { name: '第二份共享指南', exact: true });
      await expect(second).toBeVisible();
      await expectInside(second, viewport);
    });

    test('vertical navigation layout and arrow direction agree', async ({ page }) => {
      const navigation = page.getByRole('navigation', { name: '纵向回归导航', exact: true });
      const overview = navigation.getByRole('link', { name: '纵向概览', exact: true });
      const trigger = navigation.getByRole('button', { name: '纵向资源', exact: true });
      await expect(navigation.locator('.oxygen-navigation-menu__list')).toHaveCSS('flex-direction', 'column');
      const first = await overview.boundingBox();
      const second = await trigger.boundingBox();
      expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
      await overview.focus();
      await overview.press('ArrowDown');
      await expect(trigger).toBeFocused();
      await trigger.press('Enter');
      await expect(navigation.getByRole('link', { name: '纵向说明', exact: true })).toBeVisible();
    });

    test('nested closed disclosure icons remain closed when their parents are open', async ({ page }) => {
      for (const name of ['回归内层关闭', '回归内层折叠关闭']) {
        const trigger = page.getByRole('button', { name, exact: true });
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger.locator('svg')).toHaveCSS('transform', 'none');
        await trigger.click();
        await expect(trigger.locator('svg')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
      }
    });

    test('pagination remains within a 180px container with all page controls available', async ({ page }) => {
      const container = page.getByTestId('quality-pagination');
      const overflow = await container.evaluate((element) => element.scrollWidth - element.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const last = container.getByRole('button', { name: '第 100 页', exact: true });
      await last.focus();
      await expect(last).toBeFocused();
      await expectInside(last, container);
    });

    test('compact spacing uses semantic tokens while explicit numeric spacing stays in pixels', async ({ page }) => {
      await expect(page.getByTestId('quality-small-space')).toHaveCSS('gap', '8px');
      await expect(page.getByTestId('quality-token-space')).toHaveCSS('gap', '12px');
      await expect(page.getByTestId('quality-large-space')).toHaveCSS('gap', '16px');
      await expect(page.getByTestId('quality-numeric-space')).toHaveCSS('gap', '13px');
      await page.getByTestId('quality-compact').evaluate((root) => root.style.setProperty('--oxygen-space-4', '19px'));
      await expect(page.getByTestId('quality-token-space')).toHaveCSS('gap', '19px');
      await expect(page.getByTestId('quality-numeric-space')).toHaveCSS('gap', '13px');
    });

    test('timeline connectors follow node centers in compact, RTL and custom spacing', async ({ page }) => {
      const root = page.getByTestId('quality-compact');
      for (const direction of ['ltr', 'rtl']) {
        await root.evaluate((element, dir) => element.setAttribute('dir', dir), direction);
        for (const size of ['16px', '30px']) {
          await root.evaluate((element, value) => element.style.setProperty('--oxygen-space-6', value), size);
          const measurements = await root.locator('.oxygen-timeline__item').first().evaluate((item) => {
            const dot = item.querySelector('.oxygen-timeline__dot')!;
            const line = getComputedStyle(item, '::before');
            return { dotCenter: dot.getBoundingClientRect().width / 2, lineCenter: parseFloat(line.insetInlineStart) + parseFloat(line.width) / 2 };
          });
          expect(Math.abs(measurements.dotCenter - measurements.lineCenter)).toBeLessThanOrEqual(0.5);
        }
      }
    });

    test('keyboard combobox selection scrolls into view and clear restores the input', async ({ page, browserName }) => {
      const tabKey = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
      const input = page.getByRole('combobox', { name: '回归长列表', exact: true });
      await input.focus();
      for (let count = 0; count < 20; count += 1) await input.press('ArrowDown');
      const activeId = await input.getAttribute('aria-activedescendant');
      const active = page.locator(`[id=${JSON.stringify(activeId)}]`);
      await expect(active).toHaveText('回归选项 20');
      await expectInside(active, page.getByTestId('quality-combobox').getByRole('listbox'));
      await input.press(tabKey);
      const clear = page.getByTestId('quality-combobox').getByRole('button', { name: '清除', exact: true });
      await expect(clear).toBeFocused();
      await clear.press('Enter');
      await expect(input).toBeFocused();
      await input.press(tabKey);
      await expect(page.getByRole('button', { name: '回归组合框之后', exact: true })).toBeFocused();
      await expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('required and upload errors reach the actual keyboard controls', async ({ page, browserName }) => {
      const name = page.getByRole('textbox', { name: '回归姓名', exact: true });
      await expect(name).toHaveAttribute('aria-required', 'true');
      await name.focus();
      await name.press(browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab');
      const upload = page.getByRole('button', { name: '回归附件', exact: true }).and(page.locator('button'));
      await expect(upload).toBeFocused();
      await expect(upload).toHaveAttribute('aria-invalid', 'true');
      await expect(upload).toHaveAccessibleDescription('请上传回归附件');
    });

    test('composed loading and zero-percent errors retain visible state markers', async ({ page }) => {
      const loading = page.getByRole('link', { name: '回归组合加载', exact: true });
      const spinner = await loading.evaluate((element) => {
        const style = getComputedStyle(element, '::before');
        return { content: style.content, width: parseFloat(style.width), height: parseFloat(style.height), border: style.borderTopStyle, animation: style.animationName };
      });
      expect(spinner.content).toBe('""');
      expect(spinner.width).toBeGreaterThan(0);
      expect(spinner.height).toBeGreaterThan(0);
      expect(spinner.border).toBe('solid');
      expect(spinner.animation).toBe('none');
      const progress = page.getByRole('progressbar', { name: '回归失败零', exact: true });
      await expect(progress).toHaveAttribute('aria-valuenow', '0');
      await expect(progress.locator('svg')).toBeVisible();
    });

    test('an open notification announces changed content without repeating action labels', async ({ page }) => {
      await page.getByRole('button', { name: '回归开始导出', exact: true }).click();
      const toast = page.locator('.oxygen-toast').filter({ hasText: '回归导出状态' });
      await expect(toast.locator('.oxygen-toast__description')).toHaveText('导出中');
      const updates = toast.getByRole('status');
      await expect(updates).toBeEmpty();
      const update = page.getByRole('button', { name: '回归更新完成', exact: true });
      await update.focus();
      await update.press('Enter');
      await expect(toast.locator('.oxygen-toast__description')).toHaveText('导出完成');
      await expect(updates).toHaveText('回归导出状态 导出完成');
      await expect(updates).toHaveAttribute('aria-live', 'assertive');
      await expect(updates).not.toContainText('关闭');
    });
  });
}
