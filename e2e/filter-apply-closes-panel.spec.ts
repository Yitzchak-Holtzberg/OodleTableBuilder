import { test, expect } from '@playwright/test';
import { OodleTablePage } from './oodle-table.page';

/**
 * The "Active filters" panel is a Material menu. Clicking "Apply" on a filter used
 * to commit the filter but leave the whole panel open, so the user couldn't see the
 * filtered table without manually dismissing it. Apply now commits AND closes the
 * panel; Cancel still leaves it open so the user can keep managing filters.
 */
test.describe('Filter panel: Apply closes the panel', () => {
  let tb: OodleTablePage;

  test.beforeEach(async ({ page }) => {
    tb = new OodleTablePage(page);
    await tb.goto();
  });

  test('Apply commits the filter and closes the panel', async () => {
    await tb.openFilterPanel();
    await tb.addFilterFor('Party');
    await tb.setFilterValueAndApply('Democratic');
    await expect(tb.filterPanel).toBeHidden();
  });

  test('Cancel keeps the panel open', async () => {
    await tb.openFilterPanel();
    await tb.addFilterFor('Party');
    await tb.cancelFilterEdit();
    await expect(tb.filterPanel).toBeVisible();
  });
});
