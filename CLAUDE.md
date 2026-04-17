# OodleTableBuilder

Angular library published as `@saydar/table-builder`. Provides table components with filtering, sorting, pagination, virtual scroll, and persistent state.

## Consuming Project

The primary consumer is **PurchaseOrders** at:
`C:\Users\yholtzberg\Documents\PurchaseOrders\src\ClientApp`

It imports the package as `@saydar/table-builder` (`^1.0.0` in package.json). Live site: demo.oodle.app

## Local Development with PurchaseOrders

To test library changes against the real PurchaseOrders app without publishing:

1. **tsconfig paths** are configured in `C:\Users\yholtzberg\Documents\PurchaseOrders\src\ClientApp\tsconfig.json` to resolve `@saydar/table-builder` from this project's `dist/angular-utilities/` instead of `node_modules`.
2. **Build with watch**: Run `ng build AngularUtilities --watch` from this repo's root. This keeps the dist updated as you edit library source.
3. **PurchaseOrders dev server**: User starts the .NET backend + Angular frontend separately. App runs at `localhost:5000`.
4. **Login**: `yholtzberg@oodlecloud.com` / `family1234`
5. **Workflow**: Edit library source → `--watch` rebuilds dist → PurchaseOrders hot-reloads → verify in browser.

**Note:** The tsconfig paths override is machine-specific and should not be committed to PurchaseOrders.

### Bug verification pages in PurchaseOrders

| Bug | Navigate to |
|-----|-------------|
| Group-by expansion broken (VS) | Ecommerce > Pending Allocation → group by Customer Name → expand |
| Page-level scrollbar (VS) | Ecommerce > Pending Allocation |
| Column menu stays open | Ecommerce > Pending Allocation → any column ⋮ → Group By |
| Empty space when grouped | Customers > Approved Customers → group by Name → expand ~8 → scroll |
| "undefined" group + TypeError | Products > In-Development Products → group by Vendor |

### Playwright MCP tools

When running in Claude Code, use the Playwright MCP browser tools to navigate `localhost:5000`, log in, reproduce bugs, and take screenshots to verify fixes — enabling an automated edit→rebuild→verify loop.

## Testing

Playwright e2e tests are the primary test suite — not unit tests.

## Known Issues (post commit 1e3d50a — Angular modernization)

### Group-by expansion broken on virtual scroll tables
- **Where**: demo.oodle.app > Ecommerce > Pending Allocation (grouped by Customer Name)
- **Symptom**: Clicking expand on a group header toggles the chevron icon but child rows never appear. Pagination stays "1 – 1 of 1".
- **Likely cause**: The `tbGroupBy` rewrite in `table-container.ts` now mutates original data objects (`d.parentGroupName = uniqName`) instead of creating spread copies. Combined with the `initializeData` refactor that wraps group-by in a `switchMap` skipping `groups$` when ungrouped, and the VS component filtering out `when` row defs.
- **Works for some data types but not others** — needs further investigation.
- **Key files**: `table-container.ts` (lines 328-384), `generic-table.component.ts` (VS ngOnInit override)

### Page-level scrollbar on virtual scroll tables
- **Where**: demo.oodle.app > Ecommerce > Pending Allocation
- **Symptom**: Whole page gets a scrollbar it didn't have before. Last row and paginator cut off.
- **Likely cause**: DOM structure changes from standalone component migration may have broken the `VirtualScrollViewportDirective`'s DOM traversal (`children[1]?.children[0]?.children[0]`), or the viewport height calc doesn't account for all page elements. The `overflow:hidden` fix was only added to the example app, not the consuming project.
- **Key files**: `virtual-scroll-viewport.directive.ts` (line 45, 61)

### Column header menu stays open after group-by
- **Where**: demo.oodle.app > Ecommerce > Pending Allocation (any column's ⋮ menu → Group By)
- **Symptom**: Clicking "Group By" in a column's header menu performs the group-by but the menu remains open instead of auto-closing.
- **Likely cause**: The `mat-menu-item` for Group By in `header-menu.component.html` relies on default Material menu auto-close, but the standalone component migration or import changes may have broken that behavior. The filter action explicitly calls `trigger().closeMenu()` but group-by does not.
- **Key files**: `header-menu.component.html` (line 5), `header-menu.component.ts` (line 37 — `trigger` viewChild)

### Grouped table has massive empty space and page-level scrollbar
- **Where**: demo.oodle.app > Customers > Approved Customers (grouped by Name, expand ~8 groups, scroll to bottom)
- **Symptom**: (1) The table container reserves height for all 100 paginated rows, but when grouped most rows are collapsed into group headers — huge blank area below last group. (2) The table also breaks out of its container and causes a page-level scrollbar (same symptom as the Pending Allocation VS table, but this is a non-VS table).
- **Likely cause**: The table container or its parent div has a fixed/min-height based on the paginated row count rather than actual rendered content. The overflow issue may be from the standalone component migration changing the DOM nesting/host element behavior.
- **Key files**: `table-container.html`, `generic-table.component.ts`/`.html`, possibly related CSS

### Group-by produces "undefined" group + TypeError on some tables
- **Where**: demo.oodle.app > Products > In-Development Products (group by Vendor)
- **Symptom**: All rows collapse into a single "undefined (2)" group. Remaining rows render as blank. Console floods with `TypeError: Cannot read properties of undefined (reading '0')` (7+ errors).
- **Likely cause**: The `tbGroupBy` function in `table-container.ts` uses the column key to look up values on data objects, but the Vendor column likely uses a nested/computed property that doesn't resolve with a simple `d[key]` access. The rewrite from spread copies to in-place mutation may have also broken the grouping key resolution.
- **Key files**: `table-container.ts` (`tbGroupBy` around lines 328-361)

## How broken tables deviate from the oodle example (table-builder-oodle-example)

Reference: `examples/src/app/table-builder-example/table-builder-oodle-example.*`

The oodle example is a Chargeback table with `isVs`, `[offset]="100"`, 2 custom `matColumnDef`s (`notes`, `Total Amount`), flat data objects where every metadata key maps directly to a top-level property (`vendorName`, `createdOn`, `currentStatusValue`, etc.), and no `*matRowDef`, no `groupHeaderTemplate`, no `(data)` output, no selection, no footer cells. To reproduce each broken table's issue in the example, you'd need to add the following.

### Ecommerce > Pending Allocation (group-by expansion broken, page scrollbar, menu stays open)

**What's different:**
1. **`[groupHeaderTemplate]="groupHeaderTemplate"`** — The oodle example has no group header template. Pending Allocation passes a complex `#groupHeaderTemplate` with allocation controls, checkboxes, and quantity displays.
2. **`*matRowDef="let row; when: runWhen"`** — The oodle example has no custom row def. Pending Allocation has `<mat-row *matRowDef="let row; when: runWhen" [class.dark]="row.hasColor" [class.issueRow]="row.shouldMarkAsIssue">`. The VS component's `initializeRowDefs` override filters out all `when` row defs (`defs.filter(r => !r.when)`), stripping this out.
3. **No `[offset]`** — The oodle example passes `[offset]="100"`. Pending Allocation passes no offset, so the directive defaults to `167`. The PurchaseOrders page has a different header/nav height than the example, so the viewport height calc is wrong → page scrollbar.
4. **~20+ custom `matColumnDef`s** — The oodle example has 2 custom cells. Pending Allocation has ~20 (shipTo, upc, notes, modelNumber, quantity, warehouse selectors, etc.).
5. **`(data)="displayedSalesOrderLines = $event"` and `(state$)="tbStateChanged($event)"`** — The oodle example uses neither output. Pending Allocation depends on both to drive selection tracking and external state.
6. **Footer cells** — The oodle example has no footer cells. Pending Allocation uses `*matFooterCellDef` for quantity totals.
7. **Dynamic metadata** — The oodle example sets metadata once in `ngOnInit`. Pending Allocation switches between `ecommerceMeta$`, `metaForAllocation$`, and `metaWithoutAllocation$` based on allocate mode.

**To reproduce in example:** Add a `#groupHeaderTemplate`, a `*matRowDef` with `when`, remove `[offset]`, and add `(data)` output. Then group by any column on the VS table.

### Customers > Approved Customers (empty space + page scrollbar when grouped)

**What's different:**
1. **Not a VS table** — The oodle example uses `isVs`. Approved Customers uses `isVs` too, but the bug manifests with the non-VS `tb-generic-table` path (the table has few enough rows that the VS viewport isn't the issue — the grouping height calc is).
2. **`*matRowDef="let row; when: runWhen"`** — The oodle example has no custom row def. Approved Customers has one for row styling.
3. **Selection via custom column** — The oodle example has no selection. Approved Customers has a custom `customSelect` column with checkboxes and `(data)="displayedCustomers = $event; dataChange($event)"` to track selection state.
4. **Simple metadata, flat data** — Similar to oodle example (just `name` column with `FieldType.String`). The data shape is not the issue here.
5. **100 items per page with grouping** — The oodle example has ~144 rows but no grouping. When Approved Customers groups by Name (208 unique names → 208 group headers with 1 child each), the table container reserves height for 100 rendered rows but only shows collapsed group headers → massive empty space.

**To reproduce in example:** Group the chargeback table by any column (e.g., `vendorName`), expand ~8 groups, scroll to bottom. The empty space issue should appear if the table reserves height for the full page size rather than actual rendered row count.

### Products > In-Development Products (group by Vendor → "undefined" + TypeError)

**What's different:**
1. **Computed `vendor` column** — The oodle example's metadata keys all map directly to properties that exist on the `Chargeback` class (`vendorName`, `createdOn`, `departmentName`). In-Development Products enriches data in a `pipe(map(...))` before passing to `TableBuilder`, adding a `vendor` property looked up from a separate vendors array: `vendor: vendors.find(v => v.id === product.vendorId)`. The metadata key is `vendor` with `FieldType.String`. If the vendor lookup returns the vendor *object* instead of the vendor *name string*, then `d['vendor']` is an object, and `tbGroupBy` trying to use it as a group key produces `undefined` or `[object Object]`.
2. **Other computed columns** — `modelNumbers` (joined from `models` array), `modelNumbersForExport`, `portOfExport` (joined from `ports` array), `missingFields` (complex computed string). None of these exist on the raw API response — they're all added in the `map()`.
3. **`*matRowDef="let row; when: runWhen"`** — Same as other broken tables, the oodle example lacks this.
4. **Custom cells for array-like data** — The `modelNumbersForExport` and `verifiedDimensions` custom cells render lists of model numbers with "Discontinued" badges. The oodle example's custom cells just display simple values.

**To reproduce in example:** Change the chargeback data so that one metadata key maps to a value that doesn't exist on the raw object (e.g., add `{ key: 'category', displayName: 'Category', fieldType: FieldType.String }` to metadata without adding a `category` property to the data). Then group by that column. Alternatively, add an enrichment step that adds a computed property and group by it.

### Common deviations across all broken tables (not present in oodle example)

| Feature | Oodle Example | Broken PurchaseOrders Tables |
|---|---|---|
| `*matRowDef` with `when` | None | All three tables |
| `groupHeaderTemplate` | None | Pending Allocation |
| `[offset]` on VS | `[offset]="100"` | Not passed (defaults to 167) |
| Custom column count | 2 | 4–20+ |
| `(data)` output | Not used | All three tables |
| `(state$)` output | Not used | Pending Allocation |
| Footer cells | None | Pending Allocation |
| Computed/enriched columns | None (flat data) | Products (vendor, modelNumbers, etc.) |
| Dynamic metadata | Set once | Pending Allocation (3 metadata sets) |
