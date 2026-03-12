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
  readonly toggleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.viewport = page.locator('cdk-virtual-scroll-viewport');
    this.table = page.locator('mat-table');
    this.headerRow = page.locator('mat-header-row');
    this.dataRows = page.locator('cdk-virtual-scroll-viewport mat-row');
    this.footerRow = page.locator('mat-footer-row');
    this.paginator = page.locator('mat-paginator');
    this.paginatorStatus = page.getByRole('status');
    this.toggleButton = page.locator('mat-button-toggle');
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

  async toggleLinesView() {
    await this.toggleButton.click();
  }

  async waitForTableUpdate() {
    await this.page.waitForTimeout(500);
  }
}
