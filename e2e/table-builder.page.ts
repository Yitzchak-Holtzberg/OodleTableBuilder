import { Page, Locator, expect } from '@playwright/test';

export class TableBuilderPage {
  readonly page: Page;
  readonly table: Locator;
  readonly headerRow: Locator;
  readonly dataRows: Locator;
  readonly footerRow: Locator;
  readonly paginator: Locator;
  readonly paginatorStatus: Locator;
  readonly selectAllCheckbox: Locator;
  readonly addGoldButton: Locator;
  readonly filterBButton: Locator;
  readonly clearFilterButton: Locator;
  readonly addColumnButton: Locator;
  readonly clearAllFiltersButton: Locator;
  readonly trialTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('mat-table');
    this.headerRow = page.locator('mat-header-row');
    this.dataRows = page.locator('mat-row');
    this.footerRow = page.locator('mat-footer-row');
    this.paginator = page.locator('mat-paginator');
    this.paginatorStatus = page.locator('.page-amounts');
    this.selectAllCheckbox = page.locator('mat-header-cell.mat-column-select mat-checkbox');
    this.addGoldButton = page.getByRole('button', { name: 'Add Gold' });
    this.filterBButton = page.getByRole('button', { name: 'Filter B' });
    this.clearFilterButton = page.getByRole('button', { name: 'clear filter' });
    this.addColumnButton = page.getByRole('button', { name: 'Add Column' });
    this.clearAllFiltersButton = page.getByRole('button', { name: 'Cleart All Filters' });
    this.trialTitle = page.locator('.tb-header-title');
  }

  async goto() {
    await this.page.goto('/table-builder-example');
    await this.page.waitForSelector('mat-row', { timeout: 10000 });
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

  async getCellText(rowIndex: number, columnClass: string): Promise<string> {
    const cell = this.dataRows.nth(rowIndex).locator(`.mat-column-${columnClass}`);
    return (await cell.textContent())?.trim() ?? '';
  }

  async getRowText(rowIndex: number): Promise<string> {
    return (await this.dataRows.nth(rowIndex).textContent())?.trim() ?? '';
  }

  /** Click the more_vert menu button on a specific column header */
  async openColumnMenu(columnName: string) {
    const header = this.page.locator(`mat-header-cell.mat-column-${columnName}`);
    const menuBtn = header.locator('button').filter({ hasText: 'more_vert' });
    await menuBtn.click();
  }

  /** Click a menu item in the currently open column menu */
  async clickMenuItem(itemName: string) {
    await this.page.getByRole('menuitem', { name: itemName }).click();
  }

  /** Open column menu and click Group By */
  async groupByColumn(columnName: string) {
    await this.openColumnMenu(columnName);
    await this.clickMenuItem('Group By');
  }

  /** Open column menu and click Hide Column */
  async hideColumn(columnName: string) {
    await this.openColumnMenu(columnName);
    await this.clickMenuItem('Hide Column');
  }

  /** Cancel a group-by chip */
  async cancelGroupBy() {
    await this.page.getByRole('button', { name: 'cancel' }).click();
  }

  /** Click the sort button on a column header */
  async sortByColumn(columnName: string) {
    const header = this.page.locator(`mat-header-cell.mat-column-${columnName}`);
    const sortBtn = header.locator('button').first();
    await sortBtn.click();
  }

  /** Get the selection count from the footer select cell */
  async getSelectionCount(): Promise<number> {
    const footerSelectCell = this.page.locator('mat-footer-cell.mat-column-select');
    const text = (await footerSelectCell.textContent())?.trim() ?? '0';
    return parseInt(text) || 0;
  }

  /** Toggle selection for a specific row */
  async toggleRowSelection(rowIndex: number) {
    const checkbox = this.dataRows.nth(rowIndex).locator('mat-checkbox');
    await checkbox.click();
  }

  /** Toggle select all */
  async toggleSelectAll() {
    await this.selectAllCheckbox.click();
  }

  /** Apply a boolean filter (True/False) on a column */
  async applyBooleanFilter(columnName: string, value: 'True' | 'False') {
    await this.openColumnMenu(columnName);
    await this.page.getByRole('radio', { name: value }).click();
    await this.page.getByRole('button', { name: 'Apply' }).click();
  }

  /** Apply a string contains filter via the text input */
  async applyStringContainsFilter(text: string) {
    const filterInput = this.page.locator('[tbFilterStringContains]');
    await filterInput.fill(text);
  }

  /** Clear the string contains filter */
  async clearStringContainsFilter() {
    const filterInput = this.page.locator('[tbFilterStringContains]');
    await filterInput.fill('');
  }

  /** Get the collapse/expand icon text for footer */
  async getFooterCollapseIcon(): Promise<string> {
    const icon = this.page.locator('.collapse-icon.footer');
    return (await icon.textContent())?.trim() ?? '';
  }

  /** Toggle footer collapse */
  async toggleFooterCollapse() {
    await this.page.locator('.collapse-icon.footer').click();
  }

  /** Toggle header collapse */
  async toggleHeaderCollapse() {
    const collapseIcon = this.page.locator('mat-icon.collapse-icon').first();
    await collapseIcon.click();
  }

  /** Check if a column exists in the header */
  async hasColumn(columnName: string): Promise<boolean> {
    const header = this.page.locator(`mat-header-cell.mat-column-${columnName}`);
    return (await header.count()) > 0;
  }

  /** Restore a hidden column via the visibility_off toolbar button */
  async openHiddenColumnsMenu() {
    const btn = this.page.locator('.tb-header-title').locator('..').locator('button').filter({ hasText: 'visibility_off' });
    await btn.click();
  }

  /** Change page size */
  async changePageSize(size: number) {
    const pageSizeSelect = this.paginator.getByRole('combobox', { name: 'Items per page:' });
    await pageSizeSelect.click();
    await this.page.getByRole('option', { name: String(size) }).click();
  }

  /** Get the group header rows (rows with class group-header-row) */
  async getGroupHeaderRows(): Promise<Locator> {
    return this.page.locator('mat-row.group-header-row');
  }

  /** Expand a group by clicking its chevron button */
  async expandGroup(index: number) {
    const groupRows = this.page.locator('mat-row.group-header-row');
    await groupRows.nth(index).locator('button').click();
  }

  /** Scroll the virtual viewport */
  async scrollViewport(scrollTop: number) {
    await this.page.evaluate((top) => {
      const vp = document.querySelector('cdk-virtual-scroll-viewport');
      if (vp) vp.scrollTop = top;
    }, scrollTop);
  }

  /** Scroll the page */
  async scrollPage(y: number) {
    await this.page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  }

  /** Wait for table to stabilize after an action */
  async waitForTableUpdate() {
    await this.page.waitForTimeout(500);
  }
}
