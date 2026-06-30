import { Page, Locator } from '@playwright/test';

export class OodleTablePage {
  readonly page: Page;
  readonly viewport: Locator;
  readonly table: Locator;
  readonly headerRow: Locator;
  readonly dataRows: Locator;
  readonly footerRow: Locator;
  readonly paginator: Locator;
  readonly paginatorStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.viewport = page.locator('cdk-virtual-scroll-viewport');
    this.table = page.locator('mat-table');
    this.headerRow = page.locator('mat-header-row');
    this.dataRows = page.locator('cdk-virtual-scroll-viewport mat-row');
    this.footerRow = page.locator('mat-footer-row');
    this.paginator = page.locator('mat-paginator');
    this.paginatorStatus = page.locator('.page-amounts');
  }

  async goto() {
    await this.page.goto('/oodle-table-example');
    await this.page.waitForSelector('mat-row', { timeout: 10000 });
    // Dismiss webpack-dev-server overlay that intercepts clicks
    await this.page.evaluate(() => {
      document.querySelector('#webpack-dev-server-client-overlay')?.remove();
    });
  }

  async getRowCount(): Promise<number> {
    return this.dataRows.count();
  }

  async getPaginatorText(): Promise<string> {
    return (await this.paginatorStatus.textContent()) ?? '';
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = this.page.locator('mat-header-cell');
    const count = await headers.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await headers.nth(i).textContent())?.trim() ?? '';
      if (text) texts.push(text);
    }
    return texts;
  }

  async getScrollTop(): Promise<number> {
    return this.viewport.evaluate(el => el.scrollTop);
  }

  async setScrollTop(value: number) {
    await this.viewport.evaluate((el, v) => { el.scrollTop = v; }, value);
  }

  async scrollByIncrement(amount: number) {
    await this.viewport.evaluate((el, a) => { el.scrollTop += a; }, amount);
  }

  async getMaxScrollTop(): Promise<number> {
    return this.viewport.evaluate(el => el.scrollHeight - el.clientHeight);
  }

  async changePageSize(size: number) {
    const pageSizeSelect = this.paginator.getByRole('combobox', { name: 'Items per page:' });
    await pageSizeSelect.click({ force: true });
    await this.page.getByRole('option', { name: String(size), exact: true }).click();
  }

  /** Sample scrollTop multiple times over a duration to detect oscillation */
  async sampleScrollPositions(samples: number, intervalMs: number): Promise<number[]> {
    const positions: number[] = [];
    for (let i = 0; i < samples; i++) {
      positions.push(await this.getScrollTop());
      if (i < samples - 1) {
        await this.page.waitForTimeout(intervalMs);
      }
    }
    return positions;
  }

  async switchToLinesView() {
    await this.page.getByRole('radio', { name: 'Lines' }).click();
  }

  async switchToSummaryView() {
    await this.page.getByRole('radio', { name: 'Summary' }).click();
  }

  async getCellText(rowIndex: number, columnClass: string): Promise<string> {
    const cell = this.dataRows.nth(rowIndex).locator(`.mat-column-${columnClass}`);
    return (await cell.textContent())?.trim() ?? '';
  }

  async sortByColumn(columnName: string) {
    const sortHeader = this.page.locator(`mat-header-cell.mat-column-${columnName} [mat-sort-header]`);
    await sortHeader.click();
  }

  async navigateToNextPage() {
    await this.paginator.getByRole('button', { name: 'Next page' }).click();
  }

  async navigateToPreviousPage() {
    await this.paginator.getByRole('button', { name: 'Previous page' }).click();
  }

  async waitForTableUpdate() {
    await this.page.waitForTimeout(500);
  }

  /** Repro control in the example: applies a 30-value comma-separated search. */
  async addManyValueSearch() {
    await this.page.getByRole('button', { name: /Add many-value search/i }).click();
    await this.waitForTableUpdate();
  }

  /** The table header's 3-dot export / main menu button (more_vert). */
  get exportMenuButton(): Locator {
    return this.page
      .locator('.header-wrapper .flx-row-end button[mat-icon-button]')
      .filter({ has: this.page.locator('mat-icon', { hasText: 'more_vert' }) });
  }

  /** Collapsed "{n} values" pill shown for a long multi-value filter. */
  get filterCountPill(): Locator {
    return this.page.locator('lib-filter-list .fp-pills-count');
  }

  /** The "Active filters" panel rendered inside the filter button's mat-menu. */
  get filterPanel(): Locator {
    return this.page.locator('.filter-panel-menu .fp-panel');
  }

  /** Open the "Active filters" panel via the filter (funnel) trigger button. */
  async openFilterPanel() {
    await this.page.locator('.filter-trigger-button').click();
    await this.filterPanel.waitFor({ state: 'visible' });
  }

  /** From an open panel, click "+ Add filter" and pick a column by display name. */
  async addFilterFor(columnName: string) {
    await this.page.locator('.fp-add-pill').click();
    await this.page
      .locator('.fp-col-picker-item', { hasText: columnName })
      .first()
      .click();
    await this.page.locator('.fp-expanded').waitFor({ state: 'visible' });
  }

  /** Type a value into the expanded edit card and click Apply. */
  async setFilterValueAndApply(value: string) {
    await this.page.locator('.fp-expanded .fp-form-input').first().fill(value);
    await this.page.locator('.fp-expanded .fp-btn-primary').click();
  }

  /** Click Cancel in the expanded edit card. */
  async cancelFilterEdit() {
    await this.page.locator('.fp-expanded .fp-btn-ghost').click();
  }
}
