import { test, expect } from '@playwright/test';
import { OodleTablePage } from './oodle-table.page';

test.describe('Oodle Table (Chargebacks)', () => {
  let tb: OodleTablePage;

  test.beforeEach(async ({ page }) => {
    tb = new OodleTablePage(page);
    await tb.goto();
  });

  test.describe('Initial Render', () => {
    test('should display data rows', async () => {
      const count = await tb.getRowCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should have a virtual scroll viewport', async () => {
      await expect(tb.viewport).toBeVisible();
    });

    test('should have expected column headers', async () => {
      const headers = await tb.getColumnHeaders();
      const headerText = headers.join(' ');
      expect(headerText).toContain('Created On');
      expect(headerText).toContain('Created By');
      expect(headerText).toContain('Status');
      expect(headerText).toContain('Department');
      expect(headerText).toContain('Notes');
    });

    test('should show paginator', async () => {
      await expect(tb.paginator).toBeVisible();
    });
  });

  test.describe('Virtual Scroll', () => {
    test('should render rows inside the viewport', async () => {
      const rows = await tb.getRowCount();
      expect(rows).toBeGreaterThan(0);
    });

    test('should scroll to a position and stay there', async () => {
      const maxScroll = await tb.getMaxScrollTop();
      const target = Math.min(200, maxScroll * 0.5);
      await tb.setScrollTop(target);
      await tb.waitForTableUpdate();

      const scrollTop = await tb.getScrollTop();
      expect(scrollTop).toBeGreaterThan(target * 0.8);
    });

    test('should render rows after scrolling', async () => {
      const maxScroll = await tb.getMaxScrollTop();
      await tb.setScrollTop(maxScroll);
      await tb.waitForTableUpdate();

      const rows = await tb.getRowCount();
      expect(rows).toBeGreaterThan(0);
    });

    test('should not jitter during fast scrolling', async () => {
      const maxScroll = await tb.getMaxScrollTop();
      const increment = Math.ceil(maxScroll / 10);

      // Simulate rapid scrolling (like a user spinning the mouse wheel)
      for (let i = 0; i < 10; i++) {
        await tb.scrollByIncrement(increment);
        await tb.page.waitForTimeout(50);
      }

      // Wait for scroll and rendering to settle
      await tb.page.waitForTimeout(500);

      // Sample scroll position multiple times to detect oscillation/jitter
      const positions = await tb.sampleScrollPositions(5, 100);

      // All samples should be stable (no bouncing/oscillation)
      const maxDrift = Math.max(...positions) - Math.min(...positions);
      expect(maxDrift).toBeLessThan(5); // less than 5px drift = stable

      // Should have scrolled somewhere (not stuck at 0)
      expect(positions[0]).toBeGreaterThan(0);

      // Content should still be rendered at the scrolled position
      const rows = await tb.getRowCount();
      expect(rows).toBeGreaterThan(0);
    });

    test('should not jitter when scrolling back up quickly', async () => {
      // Scroll to bottom first
      const maxScroll = await tb.getMaxScrollTop();
      await tb.setScrollTop(maxScroll);
      await tb.waitForTableUpdate();

      // Now scroll back up rapidly
      const decrement = Math.ceil(maxScroll / 10);
      for (let i = 0; i < 10; i++) {
        await tb.scrollByIncrement(-decrement);
        await tb.page.waitForTimeout(50);
      }

      await tb.page.waitForTimeout(500);

      const positions = await tb.sampleScrollPositions(5, 100);
      const maxDrift = Math.max(...positions) - Math.min(...positions);
      expect(maxDrift).toBeLessThan(5);

      const rows = await tb.getRowCount();
      expect(rows).toBeGreaterThan(0);
    });

    test('should not jitter with large dataset', async () => {
      // Increase page size to get more rows in virtual scroll
      await tb.changePageSize(50);
      await tb.page.waitForSelector('cdk-virtual-scroll-viewport mat-row', { timeout: 5000 });
      await tb.waitForTableUpdate();

      const maxScroll = await tb.getMaxScrollTop();
      expect(maxScroll).toBeGreaterThan(0);

      // Rapid scroll through the larger dataset
      const increment = Math.ceil(maxScroll / 15);
      for (let i = 0; i < 15; i++) {
        await tb.scrollByIncrement(increment);
        await tb.page.waitForTimeout(30);
      }

      await tb.page.waitForTimeout(500);

      const positions = await tb.sampleScrollPositions(5, 100);
      const maxDrift = Math.max(...positions) - Math.min(...positions);
      expect(maxDrift).toBeLessThan(5);

      expect(positions[0]).toBeGreaterThan(0);

      await tb.page.waitForSelector('cdk-virtual-scroll-viewport mat-row', { timeout: 5000 });
      const rows = await tb.getRowCount();
      expect(rows).toBeGreaterThan(0);
    });
  });

  test.describe('Toggle Lines View', () => {
    test('should switch to lines view', async () => {
      await tb.toggleLinesView();
      await tb.waitForTableUpdate();
      await tb.page.waitForSelector('mat-row', { timeout: 5000 });

      const headers = await tb.getColumnHeaders();
      const headerText = headers.join(' ');
      expect(headerText).toContain('Amount');
      expect(headerText).toContain('Quantity');
    });

    test('should switch back to without-lines view', async () => {
      await tb.toggleLinesView();
      await tb.waitForTableUpdate();
      await tb.page.waitForSelector('mat-row', { timeout: 5000 });

      await tb.toggleLinesView();
      await tb.waitForTableUpdate();
      await tb.page.waitForSelector('mat-row', { timeout: 5000 });

      const headers = await tb.getColumnHeaders();
      const headerText = headers.join(' ');
      expect(headerText).toContain('Notes');
    });
  });

  test.describe('Data Display', () => {
    test('should display vendor-related data', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('QC');
    });

    test('should display status values', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('waiting for approval');
    });

    test('should display department names', async () => {
      const allText = await tb.table.textContent();
      expect(allText).toContain('QC');
    });
  });
});
