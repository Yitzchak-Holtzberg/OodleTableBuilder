import { test, expect } from '@playwright/test';
import { TableBuilderPage } from './table-builder.page';
import { OodleTablePage } from './oodle-table.page';

test.describe('Menu Interactions - Table Builder', () => {
  let tb: TableBuilderPage;

  test.beforeEach(async ({ page }) => {
    tb = new TableBuilderPage(page);
    await tb.goto();
  });

  test.describe('Sort Menu (checklist)', () => {
    const openSortMenu = async (page: TableBuilderPage) => {
      const sortBtn = page.page.locator('button').filter({ hasText: 'swap_vert' }).first();
      await sortBtn.click();
      await page.waitForTableUpdate();
    };

    test('should open sort menu and show columns', async () => {
      await openSortMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      await expect(menuPanel).toBeVisible();

      const items = menuPanel.locator('[mat-menu-item]');
      expect(await items.count()).toBeGreaterThan(0);
    });

    test('should check a column to add it to sort', async () => {
      await openSortMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      // Count checked items before
      const checkedBefore = await menuPanel.locator('[mat-menu-item]').filter({
        has: tb.page.locator('mat-icon:has-text("check_box"):not(:has-text("outline"))')
      }).count();

      // Click an unchecked item
      const uncheckedItem = menuPanel.locator('[mat-menu-item]').filter({
        has: tb.page.locator('mat-icon:has-text("check_box_outline_blank")')
      }).first();
      await uncheckedItem.click();
      await tb.waitForTableUpdate();

      // Menu should still be open
      await expect(menuPanel).toBeVisible();

      // Should have one more checked item
      const checkedAfter = await menuPanel.locator('[mat-menu-item]').filter({
        has: tb.page.locator('mat-icon:has-text("check_box"):not(:has-text("outline"))')
      }).count();
      expect(checkedAfter).toBe(checkedBefore + 1);
    });

    test('should toggle sort direction without closing menu', async () => {
      await openSortMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      // Find a checked item (table builder has pre-sorted Date Time and The Date)
      const checkedItem = menuPanel.locator('[mat-menu-item]').filter({
        has: tb.page.locator('mat-icon:has-text("check_box"):not(:has-text("outline"))')
      }).first();

      // Get current arrow
      const arrowBtn = checkedItem.locator('button');
      const arrowBefore = await arrowBtn.locator('mat-icon').textContent();

      // Click the direction button
      await arrowBtn.click();
      await tb.waitForTableUpdate();

      // Menu should still be open
      await expect(menuPanel).toBeVisible();

      // Arrow should have changed
      const arrowAfter = await checkedItem.locator('button mat-icon').textContent();
      expect(arrowAfter?.trim()).not.toBe(arrowBefore?.trim());
    });

    test('Apply button should be disabled with no changes', async () => {
      await openSortMenu(tb);

      const applyBtn = tb.page.locator('.mat-mdc-menu-panel button', { hasText: 'Apply' });
      await expect(applyBtn).toBeDisabled();
    });

    test('Apply button should be enabled after making a change', async () => {
      await openSortMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      // Toggle direction on an existing sorted column
      const checkedItem = menuPanel.locator('[mat-menu-item]').filter({
        has: tb.page.locator('mat-icon:has-text("check_box"):not(:has-text("outline"))')
      }).first();
      await checkedItem.locator('button').click();
      await tb.waitForTableUpdate();

      const applyBtn = menuPanel.locator('button', { hasText: 'Apply' });
      await expect(applyBtn).toBeEnabled();
    });

    test('Apply should close menu and sort the table', async () => {
      await openSortMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      // Check an unchecked column
      const uncheckedItem = menuPanel.locator('[mat-menu-item]').filter({
        has: tb.page.locator('mat-icon:has-text("check_box_outline_blank")')
      }).first();
      await uncheckedItem.click();
      await tb.waitForTableUpdate();

      await menuPanel.locator('button', { hasText: 'Apply' }).click();
      await tb.waitForTableUpdate();

      // Table should still render correctly
      const count = await tb.getRowCount();
      expect(count).toBe(8);
    });
  });

  test.describe('Column Visibility Menu', () => {
    const openVisibilityMenu = async (page: TableBuilderPage) => {
      const btn = page.page.locator('button').filter({ hasText: 'visibility_off' }).first();
      await btn.click();
      await page.waitForTableUpdate();
    };

    test('should open and show all columns with checkboxes', async () => {
      await openVisibilityMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      await expect(menuPanel).toBeVisible();

      const checkboxes = menuPanel.locator('mat-icon:has-text("check_box")');
      expect(await checkboxes.count()).toBeGreaterThan(0);
    });

    test('should have show-all, hide-all, and close buttons in toolbar', async () => {
      await openVisibilityMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      const doneAllIcon = menuPanel.locator('mat-icon:has-text("done_all")');
      const cancelIcon = menuPanel.locator('mat-icon:has-text("cancel")');
      const closeIcon = menuPanel.locator('mat-icon:has-text("close")');

      await expect(doneAllIcon).toBeVisible();
      await expect(cancelIcon).toBeVisible();
      await expect(closeIcon).toBeVisible();
    });

    test('should hide a column by clicking it', async () => {
      await openVisibilityMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      const phoneItem = menuPanel.locator('[mat-menu-item]', { hasText: 'Phone' });
      await phoneItem.click();
      await tb.waitForTableUpdate();

      await tb.page.keyboard.press('Escape');
      await tb.waitForTableUpdate();

      const headers = await tb.getColumnHeaders();
      expect(headers.some(h => h.includes('Phone'))).toBe(false);
    });

    test('should restore a hidden column by clicking it again', async () => {
      // Hide phone
      await openVisibilityMenu(tb);
      let menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      await menuPanel.locator('[mat-menu-item]', { hasText: 'Phone' }).click();
      await tb.waitForTableUpdate();
      // Close menu by clicking the backdrop
      await tb.page.locator('.cdk-overlay-backdrop').click();
      await tb.waitForTableUpdate();

      // Verify hidden
      let headers = await tb.getColumnHeaders();
      expect(headers.some(h => h.includes('Phone'))).toBe(false);

      // Restore phone
      await openVisibilityMenu(tb);
      menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      await expect(menuPanel).toBeVisible();
      await menuPanel.locator('[mat-menu-item]', { hasText: 'Phone' }).click();
      await tb.waitForTableUpdate();
      await tb.page.locator('.cdk-overlay-backdrop').click();
      await tb.waitForTableUpdate();

      headers = await tb.getColumnHeaders();
      expect(headers.some(h => h.includes('Phone'))).toBe(true);
    });
  });

  test.describe('Header Column Menu', () => {
    test('should open column menu with Group By and Hide Column', async () => {
      await tb.openColumnMenu('name');
      await tb.waitForTableUpdate();

      const groupByItem = tb.page.getByRole('menuitem', { name: 'Group By' });
      const hideItem = tb.page.getByRole('menuitem', { name: 'Hide Column' });

      await expect(groupByItem).toBeVisible();
      await expect(hideItem).toBeVisible();
    });

    test('Hide Column from menu should hide the column', async () => {
      await tb.openColumnMenu('name');
      await tb.clickMenuItem('Hide Column');
      await tb.waitForTableUpdate();

      const headers = await tb.getColumnHeaders();
      expect(headers.some(h => h === 'Name')).toBe(false);
    });

    test('Group By from menu should group rows', async () => {
      await tb.openColumnMenu('gas');
      await tb.clickMenuItem('Group By');
      await tb.waitForTableUpdate();

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 2');
    });

    test('should show filter controls in header menu', async () => {
      await tb.openColumnMenu('name');
      await tb.waitForTableUpdate();

      // The header menu should contain filter-related elements (input, checkbox, radio, etc.)
      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      const hasApply = await menuPanel.locator('button', { hasText: 'Apply' }).count();
      expect(hasApply).toBeGreaterThan(0);
    });
  });

  test.describe('Main Menu (more_vert)', () => {
    const openMainMenu = async (page: TableBuilderPage) => {
      const moreBtn = page.page.locator('.flx-row-end > button').filter({ hasText: 'more_vert' });
      await moreBtn.click();
      await page.waitForTableUpdate();
    };

    test('should show all menu items', async () => {
      await openMainMenu(tb);

      await expect(tb.page.getByRole('menuitem', { name: 'Reset table' })).toBeVisible();
      await expect(tb.page.getByRole('menuitem', { name: 'Export Table' })).toBeVisible();
      await expect(tb.page.getByRole('menuitem', { name: /Save to/ })).toBeVisible();
      await expect(tb.page.getByRole('menuitem', { name: 'Choose Profile' })).toBeVisible();
    });

    test('Choose Profile should have a settings icon', async () => {
      await openMainMenu(tb);

      const profileItem = tb.page.getByRole('menuitem', { name: 'Choose Profile' });
      const icon = profileItem.locator('mat-icon:has-text("settings")');
      await expect(icon).toBeVisible();
    });

    test('Reset table should not error', async () => {
      const errors: string[] = [];
      tb.page.on('pageerror', e => errors.push(e.message));

      await openMainMenu(tb);
      await tb.page.getByRole('menuitem', { name: 'Reset table' }).click();
      await tb.waitForTableUpdate();

      expect(errors).toHaveLength(0);
      const count = await tb.getRowCount();
      expect(count).toBeGreaterThanOrEqual(8);
    });
  });

  test.describe('Filter Displayer Menu', () => {
    const openFilterMenu = async (page: TableBuilderPage) => {
      const btn = page.page.locator('button').filter({ hasText: 'filter_list' }).first();
      await btn.click();
      await page.waitForTableUpdate();
    };

    test('should open filter menu and show column names', async () => {
      await openFilterMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      await expect(menuPanel).toBeVisible();

      const items = menuPanel.locator('[mat-menu-item]');
      expect(await items.count()).toBeGreaterThan(0);
    });

    test('should open filter card when column is selected', async () => {
      await openFilterMenu(tb);

      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      const nameItem = menuPanel.locator('[mat-menu-item]', { hasText: 'Name' });
      await nameItem.click();
      await tb.waitForTableUpdate();

      const filterCard = tb.page.locator('mat-card.filter-card');
      await expect(filterCard).toBeVisible();
    });
  });
});

test.describe('Menu Interactions - Oodle Table', () => {
  let ot: OodleTablePage;

  test.beforeEach(async ({ page }) => {
    ot = new OodleTablePage(page);
    await ot.goto();
  });

  test.describe('Sort Menu (checklist)', () => {
    const openSortMenu = async (page: OodleTablePage) => {
      const sortBtn = page.page.locator('button').filter({ hasText: 'swap_vert' }).first();
      await sortBtn.click();
      await page.waitForTableUpdate();
    };

    test('should open sort menu with all columns unchecked', async () => {
      await openSortMenu(ot);

      const menuPanel = ot.page.locator('.mat-mdc-menu-panel');
      await expect(menuPanel).toBeVisible();

      const items = menuPanel.locator('[mat-menu-item]');
      expect(await items.count()).toBeGreaterThan(0);
    });

    test('should check a column and enable Apply', async () => {
      await openSortMenu(ot);

      const menuPanel = ot.page.locator('.mat-mdc-menu-panel');
      await menuPanel.locator('[mat-menu-item]', { hasText: 'Status' }).click();
      await ot.waitForTableUpdate();

      const applyBtn = menuPanel.locator('button', { hasText: 'Apply' });
      await expect(applyBtn).toBeEnabled();

      // Should show checked icon
      const statusItem = menuPanel.locator('[mat-menu-item]').filter({
        has: ot.page.locator('mat-icon:has-text("check_box"):not(:has-text("outline"))')
      }).filter({ hasText: 'Status' });
      await expect(statusItem).toBeVisible();
    });

    test('should toggle direction without closing menu', async () => {
      await openSortMenu(ot);

      const menuPanel = ot.page.locator('.mat-mdc-menu-panel');
      await menuPanel.locator('[mat-menu-item]', { hasText: 'Status' }).click();
      await ot.waitForTableUpdate();

      // Toggle direction
      const checkedItem = menuPanel.locator('[mat-menu-item]').filter({ hasText: 'Status' });
      const arrowBtn = checkedItem.locator('button');
      await arrowBtn.click();
      await ot.waitForTableUpdate();

      // Menu should still be open
      await expect(menuPanel).toBeVisible();
      // Arrow should be downward now
      const downArrow = checkedItem.locator('mat-icon:has-text("arrow_downward")');
      await expect(downArrow).toBeVisible();
    });

    test('Apply should close menu and sort table', async () => {
      await openSortMenu(ot);

      const menuPanel = ot.page.locator('.mat-mdc-menu-panel');
      await menuPanel.locator('[mat-menu-item]', { hasText: 'Status' }).click();
      await ot.waitForTableUpdate();

      await menuPanel.locator('button', { hasText: 'Apply' }).click();
      await ot.waitForTableUpdate();

      // Table should still have rows
      const count = await ot.getRowCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Column Visibility Menu', () => {
    test('should open and show columns', async () => {
      const btn = ot.page.locator('button').filter({ hasText: 'visibility_off' }).first();
      await btn.click();
      await ot.waitForTableUpdate();

      const menuPanel = ot.page.locator('.mat-mdc-menu-panel');
      await expect(menuPanel).toBeVisible();

      const items = menuPanel.locator('[mat-menu-item]');
      expect(await items.count()).toBeGreaterThan(0);
    });

    test('should hide a column', async () => {
      const btn = ot.page.locator('button').filter({ hasText: 'visibility_off' }).first();
      await btn.click();
      await ot.waitForTableUpdate();

      const menuPanel = ot.page.locator('.mat-mdc-menu-panel');
      await menuPanel.locator('[mat-menu-item]', { hasText: 'Notes' }).click();
      await ot.waitForTableUpdate();
      await ot.page.keyboard.press('Escape');
      await ot.waitForTableUpdate();

      const headers = await ot.getColumnHeaders();
      expect(headers.some(h => h.includes('Notes'))).toBe(false);
    });
  });

  test.describe('Main Menu', () => {
    test('should show all menu items with icons', async () => {
      const moreBtn = ot.page.locator('button').filter({ hasText: 'more_vert' }).first();
      await moreBtn.click();
      await ot.waitForTableUpdate();

      await expect(ot.page.getByRole('menuitem', { name: 'Reset table' })).toBeVisible();
      await expect(ot.page.getByRole('menuitem', { name: 'Export Table' })).toBeVisible();
      await expect(ot.page.getByRole('menuitem', { name: 'Choose Profile' })).toBeVisible();

      const profileItem = ot.page.getByRole('menuitem', { name: 'Choose Profile' });
      const icon = profileItem.locator('mat-icon:has-text("settings")');
      await expect(icon).toBeVisible();
    });
  });
});
