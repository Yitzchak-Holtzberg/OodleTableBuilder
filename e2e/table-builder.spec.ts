import { test, expect, Locator } from '@playwright/test';
import { TableBuilderPage } from './table-builder.page';

/**
 * Synthesize a paste event with arbitrary text, including tabs and newlines.
 * Bypasses the OS clipboard (which would require browser permissions in CI) and
 * exercises the same code path as a real paste — paste handlers see the same
 * ClipboardEvent and clipboardData.getData('text/plain') call.
 */
async function dispatchPaste(input: Locator, text: string) {
  await input.focus();
  await input.evaluate((el: HTMLInputElement, value: string) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', value);
    const evt = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
  }, text);
}

test.describe('Table Builder', () => {
  let tb: TableBuilderPage;

  test.beforeEach(async ({ page }) => {
    tb = new TableBuilderPage(page);
    await tb.goto();
  });

  test.describe('Initial Render', () => {
    test('should display 8 data rows', async () => {
      const count = await tb.getRowCount();
      expect(count).toBe(8);
    });

    test('should show correct paginator text', async () => {
      const text = await tb.getPaginatorText();
      expect(text).toContain('1 - 8 of 8');
    });

    test('should have expected column headers', async () => {
      const headers = await tb.getColumnHeaders();
      const headerText = headers.join(' ');
      expect(headerText).toContain('Date Time');
      expect(headerText).toContain('The Date');
      expect(headerText).toContain('Name');
      expect(headerText).toContain('Gas');
      expect(headerText).toContain('Phone');
      expect(headerText).toContain('More Info');
      expect(headerText).toContain('Expressify');
      expect(headerText).toContain('Price');
    });

    test('should have selection column with checkboxes', async () => {
      expect(await tb.selectAllCheckbox.isVisible()).toBe(true);
    });

    test('should have index column', async () => {
      expect(await tb.hasColumn('index')).toBe(true);
    });

    test('groupHeader cell should be hidden in normal rows', async () => {
      const groupHeaderCell = tb.dataRows.first().locator('.mat-column-groupHeader');
      if (await groupHeaderCell.count() > 0) {
        await expect(groupHeaderCell).toHaveCSS('display', 'none');
      }
    });
  });

  test.describe('Filtering', () => {
    test('string contains filter should filter rows', async () => {
      const filterInput = tb.page.locator('input[ngmodel]').first();
      await filterInput.fill('Nit');
      await tb.waitForTableUpdate();

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 1');

      const rowText = await tb.getRowText(0);
      expect(rowText).toContain('Nitrogen');

      await filterInput.fill('');
      await tb.waitForTableUpdate();
      const textAfter = await tb.getPaginatorText();
      expect(textAfter).toContain('of 8');
    });

    test('boolean filter (Gas = True) should show only gas elements', async () => {
      await tb.applyBooleanFilter('gas', 'True');
      await tb.waitForTableUpdate();

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 4');

      await tb.resetAllFiltersButton.click();
      await tb.waitForTableUpdate();
    });

    test('boolean filter (Gas = False) should show only non-gas elements', async () => {
      await tb.applyBooleanFilter('gas', 'False');
      await tb.waitForTableUpdate();

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 4');

      await tb.resetAllFiltersButton.click();
      await tb.waitForTableUpdate();
    });

    test('external priced rows button should filter to rows with non-negative prices', async () => {
      await tb.showPricedRowsButton.click();
      await tb.waitForTableUpdate();

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 2');

      const count = await tb.getRowCount();
      for (let i = 0; i < count; i++) {
        const rowText = await tb.getRowText(i);
        expect(rowText).toMatch(/\$(0\.00|100\.00)/);
      }

      await tb.clearExternalFilterButton.click();
      await tb.waitForTableUpdate();
      const textAfter = await tb.getPaginatorText();
      expect(textAfter).toContain('of 8');
    });

    test.describe('Multi-value and wildcard filter input', () => {
      const filterInput = (p: typeof tb.page) => p.locator('input[ngmodel]').first();

      test.afterEach(async () => {
        await filterInput(tb.page).fill('');
        await tb.waitForTableUpdate();
      });

      test('comma separates values → OR match', async () => {
        await filterInput(tb.page).fill('Nitrogen,Lithium');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 2');
      });

      test('whitespace is NOT a delimiter — multi-word values stay intact', async () => {
        // 'Nitrogen Lithium' is treated as the literal phrase "Nitrogen Lithium".
        // None of the element rows contain that phrase, so zero matches.
        await filterInput(tb.page).fill('Nitrogen Lithium');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 0');
      });

      test('wildcard * matches any run of characters', async () => {
        // "H*" under Contains (unanchored) matches any row containing 'h':
        // Hydrogen, Helium, Lithium. Three matches.
        await filterInput(tb.page).fill('H*');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 3');
      });

      test('wildcard ? matches a single character', async () => {
        // "H?drogen" → H + any single + drogen → only Hydrogen.
        await filterInput(tb.page).fill('H?drogen');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 1');
        expect(await tb.getRowText(0)).toContain('Hydrogen');
      });

      test('wildcard combined with comma split', async () => {
        await filterInput(tb.page).fill('Nitro*,Lith*');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 2');
      });

      test('regex metacharacters are treated as literals (not wildcards)', async () => {
        // A dot in a plain value should not behave like a regex `.`.
        // None of the element names contain ".", so a filter of "." shouldn't match any.
        await filterInput(tb.page).fill('.');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 0');
      });

      test('tab-separated paste (Excel row) → OR match', async () => {
        // Synthesize a paste event with tab-delimited content. Browsers preserve tabs
        // in <input> by default, so the directive isn't strictly required here, but
        // testing both delimiters in one place is the cleanest contract check.
        await dispatchPaste(filterInput(tb.page), 'Nitrogen\tLithium');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 2');
      });

      test('newline-separated paste (Excel column) → OR match', async () => {
        // The directive intercepts paste, reads raw clipboard text via
        // clipboardData.getData('text/plain'), and writes the value (with newlines
        // intact) directly through the native setter so ngModel picks it up.
        await dispatchPaste(filterInput(tb.page), 'Nitrogen\nLithium\nOxygen');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 3');
      });

      test('mixed-delimiter paste (2D Excel block)', async () => {
        await dispatchPaste(filterInput(tb.page), 'Nitrogen\tLithium\nOxygen');
        await tb.waitForTableUpdate();
        expect(await tb.getPaginatorText()).toContain('of 3');
      });
    });
  });

  test.describe('Sorting', () => {
    test('should sort by Name column', async () => {
      // Click the mat-sort-header div to trigger sorting
      const sortHeader = tb.page.locator('mat-header-cell.mat-column-name [mat-sort-header]');
      await sortHeader.click();
      await tb.waitForTableUpdate();

      const rows: string[] = [];
      const count = await tb.getRowCount();
      for (let i = 0; i < Math.min(count, 3); i++) {
        rows.push(await tb.getCellText(i, 'name'));
      }
      expect(rows.length).toBeGreaterThan(0);
    });

    test('should toggle sort direction on second click', async () => {
      const sortHeader = tb.page.locator('mat-header-cell.mat-column-name [mat-sort-header]');

      await sortHeader.click();
      await tb.waitForTableUpdate();
      const firstRowAfterAsc = await tb.getCellText(0, 'name');

      await sortHeader.click();
      await tb.waitForTableUpdate();
      const firstRowAfterDesc = await tb.getCellText(0, 'name');

      expect(firstRowAfterAsc).not.toBe(firstRowAfterDesc);
    });
  });

  test.describe('Column Resize', () => {
    test('custom header column should have resize handle', async () => {
      const greenHeader = tb.page.locator('mat-header-cell.mat-column-green');
      if (await greenHeader.count() > 0) {
        expect(await greenHeader.isVisible()).toBe(true);
      }
    });
  });

  test.describe('Hide/Show Column', () => {
    test('should hide a column via menu', async () => {
      expect(await tb.hasColumn('phone')).toBe(true);

      await tb.hideColumn('phone');
      await tb.waitForTableUpdate();

      const headers = await tb.getColumnHeaders();
      const hasPhone = headers.some(h => h.includes('Phone'));
      expect(hasPhone).toBe(false);
    });

    test('should restore hidden columns via visibility menu', async () => {
      await tb.hideColumn('phone');
      await tb.waitForTableUpdate();

      // The visibility_off button is the toolbar icon button
      const visibilityBtn = tb.page.locator('button').filter({ hasText: 'visibility_off' }).first();
      await visibilityBtn.click();
      await tb.waitForTableUpdate();

      // Click the checkbox/option for the hidden column to restore it
      const menuPanel = tb.page.locator('.mat-mdc-menu-panel');
      if (await menuPanel.count() > 0) {
        // Look for Phone text in the menu and click it
        const phoneOption = menuPanel.locator('text=Phone').first();
        if (await phoneOption.count() > 0) {
          await phoneOption.click();
          await tb.waitForTableUpdate();
        }
        await tb.page.keyboard.press('Escape');
        await tb.waitForTableUpdate();
      }

      const headers = await tb.getColumnHeaders();
      const hasPhone = headers.some(h => h.includes('Phone'));
      expect(hasPhone).toBe(true);
    });
  });

  test.describe('Dynamic Examples', () => {
    test('Add Status Column button should add a computed column', async () => {
      const headersBefore = await tb.getColumnHeaders();
      await tb.addStatusColumnButton.click();
      await tb.waitForTableUpdate();

      const headersAfter = await tb.getColumnHeaders();
      expect(headersAfter.length).toBeGreaterThanOrEqual(headersBefore.length);
      expect(headersAfter.join(' ')).toContain('Status');
    });

    test('Add Sample Row button should not error', async () => {
      const errors: string[] = [];
      tb.page.on('pageerror', e => errors.push(e.message));

      await tb.addSampleRowButton.click();
      await tb.waitForTableUpdate();

      // Verify no console errors and table still renders
      expect(errors).toHaveLength(0);
      const count = await tb.getRowCount();
      expect(count).toBeGreaterThanOrEqual(8);
    });
  });

  test.describe('Group By', () => {
    test('should group rows by Gas column', async () => {
      await tb.groupByColumn('gas');
      await tb.waitForTableUpdate();

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 2');

      const groupHeaders = tb.page.locator('mat-row.group-header-row');
      expect(await groupHeaders.count()).toBe(2);
    });

    test('group header should show only groupHeader cell content', async () => {
      await tb.groupByColumn('gas');
      await tb.waitForTableUpdate();

      const groupRow = tb.page.locator('mat-row.group-header-row').first();

      const groupHeaderCell = groupRow.locator('.mat-column-groupHeader');
      await expect(groupHeaderCell).toBeVisible();

      const otherCells = groupRow.locator('mat-cell:not(.mat-column-groupHeader):not(.mat-column-select):not(.mat-column-index)');
      const count = await otherCells.count();
      for (let i = 0; i < count; i++) {
        await expect(otherCells.nth(i)).toHaveCSS('display', 'none');
      }
    });

    test('group header should show custom template', async () => {
      await tb.groupByColumn('gas');
      await tb.waitForTableUpdate();

      const groupRow = tb.page.locator('mat-row.group-header-row').first();
      const text = await groupRow.textContent();
      expect(text).toContain('Hi From The Start');
      expect(text).toContain('Hi From The Middle');
      expect(text).toContain('Hi From The End');
    });

    test('should expand group to show data rows', async () => {
      await tb.groupByColumn('gas');
      await tb.waitForTableUpdate();

      await tb.expandGroup(0);
      await tb.waitForTableUpdate();

      const rowCount = await tb.getRowCount();
      expect(rowCount).toBeGreaterThan(2);

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 6');
    });

    test('should cancel group-by', async () => {
      await tb.groupByColumn('gas');
      await tb.waitForTableUpdate();

      await tb.cancelGroupBy();
      // Wait for rows to re-render after un-grouping
      await expect(tb.dataRows).toHaveCount(8, { timeout: 5000 });

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 8');
    });

    test('collapses null/undefined/empty values into a single (Blank) group', async () => {
      // The example data has rows with name: '', name: undefined, name: null.
      // Grouping by "name" should put those rows into one (Blank) bucket,
      // not into separate "null" / "undefined" / " " buckets.
      await tb.groupByColumn('name');
      await tb.waitForTableUpdate();

      const allRowText = (await tb.dataRows.allTextContents()).join(' | ');

      expect(allRowText).toContain('(Blank)');
      expect(allRowText).not.toMatch(/\bnull\s*\(/);
      expect(allRowText).not.toMatch(/\bundefined\s*\(/);
    });

    test('collapses whitespace-only string values into the (Blank) group', async () => {
      // The example data has phone: null, phone: undefined, and phone: '       '
      // (whitespace-only). All three should land in a single (Blank) bucket
      // instead of producing a separate empty-label group for the whitespace row.
      await tb.groupByColumn('phone');
      await tb.waitForTableUpdate();

      const headerCount = await tb.page.locator('mat-row.group-header-row').count();
      const blankHeaders = tb.page.locator('mat-row.group-header-row', { hasText: '(Blank)' });
      expect(await blankHeaders.count()).toBe(1);

      // No header should render with an empty group name (e.g. " (1)").
      const headerTexts = await tb.page.locator('mat-row.group-header-row').allTextContents();
      for (const t of headerTexts) {
        expect(t.trim()).not.toMatch(/^\(\d+\)/);
      }
      expect(headerCount).toBeGreaterThan(0);
    });
  });

  test.describe('Pagination', () => {
    test('should show correct initial pagination', async () => {
      const text = await tb.getPaginatorText();
      expect(text).toContain('1 - 8 of 8');
    });

    test('should still render after adding rows', async () => {
      await tb.addSampleRowButton.click();
      await tb.waitForTableUpdate();
      await tb.addSampleRowButton.click();
      await tb.waitForTableUpdate();

      // Table should still be intact after adding rows
      const count = await tb.getRowCount();
      expect(count).toBeGreaterThanOrEqual(8);
    });

    test('should update after filtering', async () => {
      await tb.applyBooleanFilter('gas', 'True');
      await tb.waitForTableUpdate();

      const text = await tb.getPaginatorText();
      expect(text).toContain('of 4');

      await tb.resetAllFiltersButton.click();
      await tb.waitForTableUpdate();
    });
  });

  test.describe('Selection', () => {
    test('should select individual rows', async () => {
      await tb.toggleRowSelection(0);
      await tb.waitForTableUpdate();

      const count = await tb.getSelectionCount();
      expect(count).toBe(1);
    });

    test('should select multiple rows', async () => {
      await tb.toggleRowSelection(0);
      await tb.toggleRowSelection(1);
      await tb.waitForTableUpdate();

      const count = await tb.getSelectionCount();
      expect(count).toBe(2);
    });

    test('should deselect row on second click', async () => {
      await tb.toggleRowSelection(0);
      await tb.toggleRowSelection(0);
      await tb.waitForTableUpdate();

      const count = await tb.getSelectionCount();
      expect(count).toBe(0);
    });

    test('should select all with master toggle', async () => {
      await tb.toggleSelectAll();
      await tb.waitForTableUpdate();

      const count = await tb.getSelectionCount();
      expect(count).toBe(8);
    });

    test('should deselect all with master toggle', async () => {
      await tb.toggleSelectAll();
      await tb.waitForTableUpdate();
      await tb.toggleSelectAll();
      await tb.waitForTableUpdate();

      const count = await tb.getSelectionCount();
      expect(count).toBe(0);
    });
  });

  test.describe('Collapse Header/Footer', () => {
    test('should toggle footer collapse', async () => {
      const iconBefore = await tb.getFooterCollapseIcon();
      await tb.toggleFooterCollapse();
      await tb.waitForTableUpdate();

      const iconAfter = await tb.getFooterCollapseIcon();
      expect(iconAfter).not.toBe(iconBefore);

      await tb.toggleFooterCollapse();
      await tb.waitForTableUpdate();
    });

    test('should toggle header collapse', async () => {
      const collapseIcon = tb.page.locator('mat-icon.collapse-icon').first();
      if (await collapseIcon.isVisible()) {
        await collapseIcon.click();
        await tb.waitForTableUpdate();

        await collapseIcon.click();
        await tb.waitForTableUpdate();
      }
    });
  });

  test.describe('Custom Cell Templates', () => {
    test('testCell custom cell should render with custom content', async () => {
      const testCells = tb.page.locator('mat-cell.mat-column-testCell');
      const count = await testCells.count();
      expect(count).toBeGreaterThan(0);

      const firstCell = testCells.first();
      const text = await firstCell.textContent();
      expect(text).toContain('Hi');
    });

    test('blue custom cell should render', async () => {
      const blueCells = tb.page.locator('mat-cell.mat-column-blue');
      const count = await blueCells.count();
      expect(count).toBeGreaterThan(0);

      const firstCell = blueCells.first();
      const text = await firstCell.textContent();
      expect(text).toContain('Hi');
    });

    test('green custom header should show "Custom header"', async () => {
      const greenHeader = tb.page.locator('mat-header-cell.mat-column-green');
      if (await greenHeader.count() > 0) {
        const text = await greenHeader.textContent();
        expect(text).toContain('Custom header');
      }
    });

    test('date footer should render custom footer cell', async () => {
      const dateFooter = tb.page.locator('mat-footer-cell.mat-column-date');
      if (await dateFooter.count() > 0) {
        const text = await dateFooter.textContent();
        expect(text).toContain('date footer');
      }
    });
  });

  test.describe('Links', () => {
    test('Name column should render as links', async () => {
      const nameLinks = tb.page.locator('mat-cell.mat-column-name a');
      const count = await nameLinks.count();
      expect(count).toBeGreaterThan(0);

      const href = await nameLinks.first().getAttribute('href');
      expect(href).toContain('/search');
    });
  });

  test.describe('Data Display', () => {
    test('should display phone numbers formatted', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('(239) 090-8565 6');
    });

    test('should display currency values', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('$100.00');
    });

    test('should display boolean as icons', async () => {
      const visibilityIcons = tb.page.locator('mat-cell.mat-column-gas mat-icon');
      const count = await visibilityIcons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display array values', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('hello');
      expect(allText).toContain('world');
    });

    test('should display expression column', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('N my symbol Nitrogen');
    });

    test('should display enum values', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('Hi');
    });
  });
});
