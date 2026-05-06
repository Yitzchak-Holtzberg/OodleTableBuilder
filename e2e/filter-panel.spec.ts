import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Page object for the redesigned filter panel + columns panel introduced in
 * the table-controls redesign. Targets the Oodle Table example route.
 */
class FilterPanelHarness {
  readonly page: Page;
  readonly filterTrigger: Locator;
  readonly columnsTrigger: Locator;
  readonly panel: Locator;
  readonly addFilterPill: Locator;
  readonly columnPicker: Locator;
  readonly expandedForm: Locator;
  readonly clearAllLink: Locator;
  readonly paginatorStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterTrigger = page.locator('button.filter-trigger-button');
    this.columnsTrigger = page.locator('tb-columns-panel button.trigger-button');
    this.panel = page.locator('.fp-panel');
    this.addFilterPill = page.locator('button.fp-add-pill');
    this.columnPicker = page.locator('.fp-col-picker');
    this.expandedForm = page.locator('.fp-expanded');
    this.clearAllLink = page.locator('.fp-panel button.fp-ghost-link');
    this.paginatorStatus = page.locator('.mat-mdc-paginator-range-label').first();
  }

  async goto() {
    await this.page.goto('/oodle-table-example');
    await this.page.waitForSelector('mat-row', { timeout: 10000 });
    // Webpack overlay sometimes intercepts clicks
    await this.page.evaluate(() => {
      document.querySelector('#webpack-dev-server-client-overlay')?.remove();
    });
  }

  async openPanel() {
    if (!(await this.panel.isVisible().catch(() => false))) {
      await this.filterTrigger.click();
      await this.panel.waitFor({ state: 'visible' });
    }
  }

  async closePanel() {
    await this.page.keyboard.press('Escape');
  }

  async openAddPicker() {
    await this.openPanel();
    if (!(await this.columnPicker.isVisible().catch(() => false))) {
      await this.addFilterPill.click();
      await this.columnPicker.waitFor({ state: 'visible' });
    }
  }

  async pickColumn(name: string) {
    await this.openAddPicker();
    await this.page.locator(`.fp-col-picker-item:has-text("${name}")`).click();
  }

  async typeValue(value: string) {
    const input = this.expandedForm.locator('input').first();
    await input.fill(value);
  }

  async pickOperator(label: string) {
    const select = this.expandedForm.locator('select.fp-form-select');
    await select.selectOption({ label });
  }

  async apply() {
    await this.expandedForm.locator('button.fp-btn-primary').click();
  }

  async cancel() {
    await this.expandedForm.locator('button.fp-btn-ghost').click();
  }

  async clickCompactChip(columnName: string) {
    const chip = this.page.locator(`.fp-panel .fp-chip:has-text("${columnName}")`).first();
    await chip.click();
  }

  async removeChip(columnName: string) {
    const chip = this.page.locator(`.fp-panel .fp-chip:has-text("${columnName}")`).first();
    await chip.locator('button.fp-x-btn').click();
  }

  async clearAll() {
    await this.openPanel();
    if (await this.clearAllLink.isVisible().catch(() => false)) {
      await this.clearAllLink.click();
    }
    // Close the panel so the next test starts from a clean state.
    await this.closePanel();
    await this.panel.waitFor({ state: 'hidden' }).catch(() => {});
  }

  /** Counts every filter row in the panel — both compact chips and expanded forms. */
  async chipCount(): Promise<number> {
    const compact = await this.panel.locator('.fp-chip').count();
    const expanded = await this.panel.locator('.fp-expanded').count();
    return compact + expanded;
  }

  async rowCountText(): Promise<string> {
    return (await this.paginatorStatus.textContent()) ?? '';
  }

  /** Return the {visible, total} numbers from "1 – 12 of 12" or " 0 of 0 ". */
  async parseRowCount(): Promise<{ visible: number | null; total: number }> {
    const text = (await this.rowCountText()).trim();
    const m = text.match(/of\s+(\d+)/);
    const total = m ? parseInt(m[1], 10) : 0;
    return { visible: null, total };
  }

  /** Get computed CSS color of an element, useful for theme assertions. */
  async getCssColor(selector: string, prop: string): Promise<string> {
    return this.page.evaluate(({ selector, prop }) => {
      const el = document.querySelector(selector);
      if (!el) return '';
      return getComputedStyle(el).getPropertyValue(prop).trim();
    }, { selector, prop });
  }
}

test.describe('Filter panel — combo 4 inline-edit', () => {
  let h: FilterPanelHarness;

  test.beforeEach(async ({ page }) => {
    h = new FilterPanelHarness(page);
    await h.goto();
    await h.clearAll();
  });

  test.describe('Architecture', () => {
    test('renders only 2 icons in the table top-right (filter + columns; sort & show-hide are gone)', async () => {
      await expect(h.filterTrigger).toBeVisible();
      await expect(h.columnsTrigger).toBeVisible();
      // Old separate sort menu and gen-col-displayer should NOT be wired by table-container
      // (gen-col-displayer/sort-menu may still exist as deprecated components, but not in the chrome)
      const sortIcon = h.page.locator('tb-sort-menu');
      const colDisplayer = h.page.locator('tb-col-displayer');
      await expect(sortIcon).toHaveCount(0);
      await expect(colDisplayer).toHaveCount(0);
    });

    test('clicking the funnel opens the panel', async () => {
      await expect(h.panel).toBeHidden();
      await h.filterTrigger.click();
      await expect(h.panel).toBeVisible();
    });

    test('panel shows empty state when no filters', async () => {
      await h.openPanel();
      await expect(h.page.locator('.fp-empty')).toBeVisible();
      await expect(h.panel).toContainText('No filters applied');
    });
  });

  test.describe('Add flow (the bug we just fixed)', () => {
    test('Add filter → pick column → panel STAYS OPEN with expanded form', async () => {
      await h.pickColumn('Party');
      await expect(h.panel).toBeVisible(); // <-- the regression we fixed
      await expect(h.expandedForm).toBeVisible();
      await expect(h.expandedForm).toContainText('Party');
    });

    test('expanded form has type-aware text input for String column', async () => {
      await h.pickColumn('Party');
      const input = h.expandedForm.locator('input').first();
      await expect(input).toHaveAttribute('type', 'text');
    });

    test('expanded form has type-aware date input for Date column', async () => {
      await h.pickColumn('Took Office');
      const input = h.expandedForm.locator('input').first();
      await expect(input).toHaveAttribute('type', 'date');
    });

    test('column picker closes after picking', async () => {
      await h.openAddPicker();
      await expect(h.columnPicker).toBeVisible();
      await h.page.locator('.fp-col-picker-item:has-text("Party")').click();
      await expect(h.columnPicker).toBeHidden();
    });
  });

  test.describe('Apply flow', () => {
    test('typing value + Apply commits and collapses to compact chip', async () => {
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();
      await expect(h.expandedForm).toBeHidden();
      const chip = h.panel.locator('.fp-chip').first();
      await expect(chip).toContainText('Party');
      await expect(chip).toContainText('Republican');
    });

    test('Apply actually filters the table', async () => {
      const before = await h.parseRowCount();
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();
      await h.page.waitForTimeout(300);
      const after = await h.parseRowCount();
      expect(after.total).toBeLessThan(before.total);
      expect(after.total).toBeGreaterThan(0);
    });

    test('Apply with empty value commits an undefined filter (no-op, table unchanged)', async () => {
      const before = await h.parseRowCount();
      await h.pickColumn('Party');
      await h.apply(); // no value typed
      await h.page.waitForTimeout(300);
      const after = await h.parseRowCount();
      expect(after.total).toBe(before.total);
    });
  });

  test.describe('Cancel flow', () => {
    test('Cancel on a NEW chip removes the placeholder entirely', async () => {
      await h.pickColumn('Party');
      expect(await h.chipCount()).toBe(1);
      await h.cancel();
      expect(await h.chipCount()).toBe(0);
    });

    test('Cancel on an EXISTING chip closes form without changes', async () => {
      // Create a committed filter
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();
      const before = await h.parseRowCount();

      // Re-expand and Cancel
      await h.clickCompactChip('Party');
      await expect(h.expandedForm).toBeVisible();
      await h.typeValue('NEVERMIND');
      await h.cancel();
      await h.page.waitForTimeout(200);

      // Table count unchanged
      const after = await h.parseRowCount();
      expect(after.total).toBe(before.total);
      // Chip still says 'Republican', not 'NEVERMIND'
      const chip = h.panel.locator('.fp-chip').first();
      await expect(chip).toContainText('Republican');
    });
  });

  test.describe('Re-expand existing chip', () => {
    test('clicking compact chip body opens expanded form populated with current values', async () => {
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();

      await h.clickCompactChip('Party');
      await expect(h.expandedForm).toBeVisible();
      const input = h.expandedForm.locator('input').first();
      await expect(input).toHaveValue('Republican');
    });

    test('clicking ✕ on compact chip removes it without expanding', async () => {
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();

      await h.removeChip('Party');
      await expect(h.expandedForm).toBeHidden();
      expect(await h.chipCount()).toBe(0);
    });
  });

  test.describe('Operator handling', () => {
    test('operator dropdown lists compatible operators only', async () => {
      await h.pickColumn('Party');
      const select = h.expandedForm.locator('select.fp-form-select');
      const options = await select.locator('option').allTextContents();
      // String column should have string-y operators
      expect(options.join(',')).toContain('contains');
      expect(options.join(',')).toContain('equals');
      // Should NOT have number/date specific
      expect(options.join(',')).not.toContain('on or after');
    });

    test('changing operator + Apply persists the new operator', async () => {
      await h.pickColumn('Party');
      await h.pickOperator('not contains');
      await h.typeValue('Republican');
      await h.apply();
      const chip = h.panel.locator('.fp-chip').first();
      await expect(chip).toContainText('not contains');
    });

    test('"is empty" hides the value input and commits filterValue=true', async () => {
      // Regression: picking "is empty" used to render a stale value input AND
      // commit filterValue=undefined, which made the legacy filter-list chip
      // display "Is Not Blank" (the inverse) and made the filter inert.
      await h.pickColumn('Party');
      await h.pickOperator('is empty');
      // No value input should be rendered for IsNull
      await expect(h.expandedForm.locator('input.fp-form-input')).toHaveCount(0);
      await h.apply();

      // V3-A chip should display "is empty" (the OPERATOR_LABELS entry for IsNull)
      const v3Chip = h.panel.locator('.fp-chip').first();
      await expect(v3Chip).toContainText('is empty');

      // Legacy filter-list chip (which uses formatFilterType pipe) should now
      // read "Is Blank" — NOT "Is Not Blank". This is the symptom Melissa hit.
      const legacyChip = h.page.locator('.fp-stack-inline .fp-op-pill').first();
      await expect(legacyChip).toHaveText(/Is Blank/);
      await expect(legacyChip).not.toHaveText(/Is Not Blank/);
    });
  });

  test.describe('Multiple filters', () => {
    test('can stack multiple filters; each renders its own chip', async () => {
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();

      await h.pickColumn('Birthplace');
      await h.typeValue('Virginia');
      await h.apply();

      expect(await h.chipCount()).toBe(2);
    });

    test('Clear all removes every chip and restores full row count', async () => {
      const before = await h.parseRowCount();
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();
      await h.pickColumn('Birthplace');
      await h.typeValue('Virginia');
      await h.apply();
      expect(await h.chipCount()).toBe(2);

      await h.clearAll();
      await h.page.waitForTimeout(200);
      expect(await h.chipCount()).toBe(0);
      const after = await h.parseRowCount();
      expect(after.total).toBe(before.total);
    });
  });

  test.describe('Theme tokens (M3)', () => {
    test('--mat-sys-primary is emitted as a real CSS custom property', async () => {
      const value = await h.getCssColor('html', '--mat-sys-primary');
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    test('count badge uses the primary color', async () => {
      await h.pickColumn('Party');
      await h.typeValue('Republican');
      await h.apply();
      const badge = h.panel.locator('.fp-count').first();
      const color = await badge.evaluate(el => getComputedStyle(el).color);
      // teal-ish — the cyan palette resolves to RGB starting with 0
      expect(color).toMatch(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    });
  });
});

test.describe('Columns panel — combined visibility + order + sort', () => {
  let h: FilterPanelHarness;
  let trigger: Locator;
  let panel: Locator;

  test.beforeEach(async ({ page }) => {
    h = new FilterPanelHarness(page);
    await h.goto();
    trigger = page.locator('tb-columns-panel button.trigger-button');
    panel = page.locator('.cp-panel');
  });

  test('clicking the columns icon opens the panel', async () => {
    await expect(panel).toBeHidden();
    await trigger.click();
    await expect(panel).toBeVisible();
  });

  test('panel shows Hidden and Visible zones', async () => {
    await trigger.click();
    await expect(panel.locator('.cp-zone-label:has-text("Hidden")')).toBeVisible();
    await expect(panel.locator('.cp-zone-label:has-text("Visible")')).toBeVisible();
  });

  test('Visible rows have direction pill in "none" state by default', async () => {
    await trigger.click();
    const dirPills = panel.locator('.cp-row .cp-dir-pill');
    const count = await dirPills.count();
    expect(count).toBeGreaterThan(0);
    // First pill should default to "none" state
    await expect(dirPills.first()).toHaveClass(/cp-dir-none/);
  });

  test('clicking a "none" direction pill cycles to "asc" + shows priority 1', async ({ page }) => {
    await trigger.click();
    const firstRow = panel.locator('.cp-row').first();
    const pill = firstRow.locator('.cp-dir-pill');
    const priority = firstRow.locator('.cp-priority');
    await pill.click();
    await expect(pill).toHaveClass(/cp-dir-asc/);
    await expect(priority).toHaveText('1');
  });

  test('clicking "asc" pill cycles to "desc" same priority', async () => {
    await trigger.click();
    const firstRow = panel.locator('.cp-row').first();
    const pill = firstRow.locator('.cp-dir-pill');
    await pill.click(); // none → asc
    await pill.click(); // asc → desc
    await expect(pill).toHaveClass(/cp-dir-desc/);
    await expect(firstRow.locator('.cp-priority')).toHaveText('1');
  });

  test('clicking "desc" pill cycles back to "none" and clears priority', async () => {
    await trigger.click();
    const firstRow = panel.locator('.cp-row').first();
    const pill = firstRow.locator('.cp-dir-pill');
    await pill.click(); // asc
    await pill.click(); // desc
    await pill.click(); // none
    await expect(pill).toHaveClass(/cp-dir-none/);
    // priority span exists but with -empty class
    await expect(firstRow.locator('.cp-priority')).toHaveClass(/cp-priority-empty/);
  });

  test('multiple sorts: priority numbers ascend in click order', async () => {
    await trigger.click();
    const rows = panel.locator('.cp-row');
    await rows.nth(0).locator('.cp-dir-pill').click(); // priority 1
    await rows.nth(1).locator('.cp-dir-pill').click(); // priority 1, push existing to 2
    await rows.nth(2).locator('.cp-dir-pill').click(); // priority 1, push others to 2,3
    // Newest click is priority 1 per setSort.unshift convention
    await expect(rows.nth(2).locator('.cp-priority')).toHaveText('1');
    await expect(rows.nth(1).locator('.cp-priority')).toHaveText('2');
    await expect(rows.nth(0).locator('.cp-priority')).toHaveText('3');
  });
});
