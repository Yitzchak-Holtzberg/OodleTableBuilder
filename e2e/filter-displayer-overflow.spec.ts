import { test, expect, Page } from '@playwright/test';
import { OodleTablePage } from './oodle-table.page';

/**
 * Regression: a long comma-separated multi-value search used to render one
 * unbounded pill per value, growing the active-filter displayer until it covered
 * the top-right 3-dot export menu and made it unclickable. The fix collapses
 * >3 values into a single "{n} values" pill whose list expands as a floating
 * vertical menu (height-capped + scrollable), bounds the header layout so the
 * export menu stays clickable, adds a per-value remove, and lets you double-click
 * a value row in the menu to edit just that value inline.
 *
 * The repro searches the current dataset's name column for all values minus a few
 * omitted ones, so the search visibly filters the table and the menu is long
 * enough to scroll. The exact count depends on the dataset, so it's read at runtime.
 */
async function valueCount(page: Page): Promise<number> {
  const txt = (await page.locator('lib-filter-list .fp-pills-count').textContent()) ?? '';
  const m = /(\d+)\s+values/.exec(txt);
  return m ? Number(m[1]) : 0;
}

test.describe('Filter displayer multi-value overflow', () => {
  let tb: OodleTablePage;

  test.beforeEach(async ({ page }) => {
    tb = new OodleTablePage(page);
    await tb.goto();
    await tb.addManyValueSearch();
  });

  test('collapses many values into a count pill', async ({ page }) => {
    await expect(tb.filterCountPill).toBeVisible();
    await expect(tb.filterCountPill).toContainText(/\d+ values/);
    expect(await valueCount(page)).toBeGreaterThan(3);
    // collapsed: no individual value pills rendered yet
    await expect(page.locator('lib-filter-list .filter-value-pill')).toHaveCount(0);
  });

  test('expands the value list as a scrollable menu when the count pill is clicked', async ({ page }) => {
    const n = await valueCount(page);
    await tb.filterCountPill.click();
    const pills = page.locator('lib-filter-list .fp-pill-overflow .filter-value-pill');
    await expect(pills.first()).toBeVisible();
    await expect(pills).toHaveCount(n);
    // inner scroller is height-capped + scrollable within, and never scrolls sideways
    const box = await page.locator('lib-filter-list .fp-menu-scroll').evaluate((el: HTMLElement) => ({
      vScroll: el.scrollHeight > el.clientHeight,
      hOverflow: el.scrollWidth - el.clientWidth,
    }));
    expect(box.vScroll).toBe(true);
    expect(box.hOverflow).toBeLessThanOrEqual(0);
  });

  test('keeps the 3-dot export menu visible and clickable', async ({ page }) => {
    await expect(tb.exportMenuButton).toBeVisible();
    // If the displayer covered the button, this click would fail Playwright's
    // actionability (pointer-interception) check.
    await tb.exportMenuButton.click();
    await expect(page.locator('.mat-mdc-menu-panel, .mat-menu-panel')).toBeVisible();
  });

  test('the search actually filters the table', async () => {
    // A searched president is present; an omitted one (Abraham Lincoln) is filtered out.
    await expect(tb.table).toContainText('George Washington');
    await expect(tb.table).not.toContainText('Abraham Lincoln');
  });

  test('a per-value ✕ removes just that value and re-runs the search', async ({ page }) => {
    const n = await valueCount(page);
    await tb.filterCountPill.click();
    await page.getByRole('button', { name: 'Remove value George Washington' }).click();
    await tb.waitForTableUpdate();
    // One fewer value, and Washington's rows are now filtered out.
    await expect(tb.filterCountPill).toContainText(`${n - 1} values`);
    await expect(tb.table).not.toContainText('George Washington');
  });

  test('double-click a value row in the menu edits just that value inline', async ({ page }) => {
    const n = await valueCount(page);
    await tb.filterCountPill.click();
    const row = page.locator('lib-filter-list .fp-pill-overflow .filter-value-pill', { hasText: 'George Washington' });
    await row.dblclick();
    const input = page.locator('lib-filter-list .fp-edit-input');
    await expect(input).toBeVisible();
    await input.fill('Zzz Nobody');
    await input.press('Enter');
    await tb.waitForTableUpdate();
    // value count is unchanged (replaced, not removed), but Washington no longer matches
    await expect(tb.filterCountPill).toContainText(`${n} values`);
    await expect(tb.table).not.toContainText('George Washington');
  });
});
