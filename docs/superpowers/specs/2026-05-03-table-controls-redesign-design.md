# Table-controls redesign — design spec

**Date:** 2026-05-03
**Owner:** @yholtzberg
**Branch (proposed):** `feat/table-controls-redesign`
**Status:** design — pending implementation plan

## Context

Today the table's top-right has **three icon buttons**, each opening a distinct `mat-menu`:

| Icon              | Component                | Issue today |
|-------------------|--------------------------|-------------|
| `filter_list`     | [tb-filter-displayer](../../projects/angular-utilities/src/table-builder/components/table-container-filter/gen-filter-displayer/gen-filter-displayer.component.html) | Opens a column-picker menu. Selecting a column opens a *second* popup elsewhere ("Created By Name Filter") to actually edit the filter. Two surfaces, disconnected. |
| `visibility_off`  | [tb-col-displayer](../../projects/angular-utilities/src/table-builder/components/gen-col-displayer/gen-col-displayer.component.html) | Combined visibility + reorder. Uses icon-buttons-as-checkboxes (broken a11y), `indeterminate_check_box` for hidden state (cryptic), close button at top of menu. |
| `swap_vert`       | [tb-sort-menu](../../projects/angular-utilities/src/table-builder/components/sort-menu/sort-menu.component.html) | Two drag-lists ("Sorted" / "Not Sorted"), per-row up/down direction icon-buttons, dirty-state Apply gate. Sorting feels like a form submission. |

Wired into the table at [table-container.html:66-72](../../projects/angular-utilities/src/table-builder/components/table-container/table-container.html#L66-L72).

Three problems:
1. **Inconsistent UX patterns** — three menus, three different mental models.
2. **Filter UI is two-step** — the column picker doesn't lead directly to the value editor; a second popup mediates.
3. **Show/hide and Sort overlap conceptually** — both are column-level configuration. Splitting them across two icons forces users to bounce between menus to set up a view.

## Intended outcome

Reduce to **two icons** (filter funnel + columns) with two unified panels that share visual language. Eliminate the "Apply" gating on sort. Replace icon-button-toggles with semantically correct controls. Both panels apply changes live with optional undo.

---

## Final design

### Architecture: 2 icons, 2 panels

```
TOP RIGHT OF TABLE

  [filter funnel]   [columns gear]   [⋮ extra menu]
      ↓                  ↓
 Filter panel       Columns panel
 (chips)            (zones + inline sort)
```

The third icon (`⋮` extra menu) keeps Reset table / Export / Save profile and is unchanged.

### Panel 1: Filter

**Surface:** click filter funnel icon → opens panel below the icon (existing `mat-menu` pattern).

**Layout:** single-column stack of filter chips. Each chip is one active filter.

```
┌────────────────────────────────────────────┐
│ Active filters [count]    [+ Add filter]  │  ← header
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  │
│ │ Status   [contains]  approved  [✕]  │  │  ← chip
│ └──────────────────────────────────────┘  │
│ ┌──────────────────────────────────────┐  │
│ │ Total    [   >    ]  $1,000    [✕]  │  │
│ └──────────────────────────────────────┘  │
│ ┌──────────────────────────────────────┐  │
│ │ Qty      [   =    ]  10        [✕]  │  │
│ └──────────────────────────────────────┘  │
├────────────────────────────────────────────┤
│ 3 of 144 rows           Clear all          │  ← footer
└────────────────────────────────────────────┘
```

**Per-chip anatomy:**
- **Column name** — bold weight, 600. Click → column dropdown to change which column.
- **Operator pill** — full-strength violet (`var(--mat-sys-primary)`) background, white text, `min-width: 24px` (so `>`, `=` etc. don't shrink). Click → operator dropdown for that column's data type. Always violet regardless of operator length.
- **Value** — input, borderless until focused, ellipsis on overflow, full text in `title` attr.
- **Remove ✕** — only opacity 1 on chip hover.

**Behavior:**
- Apply on every keystroke / dropdown change (same debouncing as today).
- `+ Add filter` → expands a "new chip" row in-place with column dropdown focused. Picking a column reveals operator + value fields. Filling them creates the chip.
- Hitting ✕ removes the filter immediately (no confirm).
- "Clear all" empties the list with a brief inline undo banner ("Cleared 3 filters · Undo").

**Empty state:** zero chips → panel shows centered text "No filters applied" + a `+ Add filter` pill.

### Panel 2: Columns (combined visibility + order + sort)

**Surface:** click columns gear icon → opens panel below the icon.

**Layout:** two zones (Hidden / Visible) like the existing show/hide prototype, but each Visible-zone row is enriched with sort controls.

```
┌────────────────────────────────────────────────────────┐
│ Columns [3 / 5 visible · 3 sorted]                    │
├────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌────────────────────────────────────┐ │
│ │ HIDDEN  [2] │ │ VISIBLE  [3]                       │ │
│ ├─────────────┤ ├────────────────────────────────────┤ │
│ │ ⋮⋮ Notes    │ │ ⋮⋮ Created On  [2]  [↓ desc]       │ │
│ │ ⋮⋮ Created  │ │ ⋮⋮ Status      [1]  [↑ asc ]       │ │
│ │    By       │ │ ⋮⋮ Department       [ sort ]       │ │
│ │             │ │ ⋮⋮ Total Amt   [3]  [↓ desc]       │ │
│ └─────────────┘ └────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ Drag between zones · Drag inside Visible to reorder   │
│ Click direction pill to cycle sort → asc → desc       │
└────────────────────────────────────────────────────────┘
```

**Per Visible-zone row anatomy:**
- **Drag handle (⋮⋮)** — opacity 0.6 at rest, 1 on row hover, cursor `grab`. Reorders the column's position in the *table* (i.e., left-to-right in the actual rendered table).
- **Column name** — weight 500.
- **Sort priority badge** — small filled-circle with number (1, 2, 3). Only visible when the column has sort applied. Indicates ORDER OF APPLICATION (priority 1 = most important sort).
- **Direction pill** — three-state cycle on click:
  1. `none` (gray outline, says "sort") — column is not part of the sort
  2. `asc` (filled violet, says "↑ asc") — sort ascending
  3. `desc` (filled violet, says "↓ desc") — sort descending
  4. → back to none

  Cycle order: `none → asc → desc → none`

- **No remove ✕ on visible rows** — to "remove" a column, drag it back to Hidden zone.

**Per Hidden-zone row anatomy:**
- Drag handle, dimmed column name, dashed border. Drag to Visible to show the column.

**Behavior:**
- **Drag column from Hidden → Visible:** column appears in Visible zone (and table) with sort = none.
- **Drag column from Visible → Hidden:** column disappears from table. If it had sort applied, the sort is dropped and remaining sorted columns' priority badges renumber automatically (e.g., if priority 2 is hidden, priority 3 becomes 2).
- **Drag within Visible:** reorders the column's left-to-right position in the table. **Does NOT change sort priority.**
- **Click direction pill on a `none` column:** column becomes priority 1 (most important sort). Existing sorted columns' priorities shift down: previous P1 → P2, P2 → P3, etc. Rationale: "the thing I just clicked is the most important", matches existing `setSort.unshift` semantics.
- **Click direction pill on a sorted column:** cycles its direction (asc ↔ desc). Priority unchanged (the column stays in its current array slot).
- **Click direction pill again to remove sort:** returns to none. Removed from `state.sorted`, priority gap closes (other priorities renumber via array shift).
- **No Apply button.** Every change is live. (Optional: "Reset to default view" link in footer.)

**Empty states:**
- Zero hidden: Hidden zone shows "All columns visible" centered.
- Zero visible: Visible zone shows "No columns visible — add at least one" centered (this is a soft guard; we don't block the user).

### Why sort priority is independent of column order

The single most important design call. We considered tying sort priority to top-to-bottom position in the Visible zone (simpler model) but rejected it:

- Users frequently want a column at the *right edge* of the table (reference data) but as their *primary sort* (e.g., "Total Amount" pinned right, but always sort by it). Coupling them forces an awkward tradeoff.
- Excel, Airtable, Notion, Linear all decouple sort priority from visual order. Matches user expectations from those tools.
- The numbered priority badges make priority scannable; the visual order is its own job (table column position).

Tradeoff accepted: the user has to learn that "drag the row" reorders the table, while "click the pill" sets sort priority. Both gestures are inherent to the row, so they coexist without ambiguity.

---

## Components to modify

### Library (`projects/angular-utilities/src/table-builder/`)

| File | Change |
|---|---|
| [components/table-container/table-container.html](../../projects/angular-utilities/src/table-builder/components/table-container/table-container.html) | Replace the `<tb-col-displayer>` and `<tb-sort-menu>` with a new `<tb-columns-panel>` component. Keep `<tb-filter-displayer>`. |
| [components/table-container-filter/gen-filter-displayer/gen-filter-displayer.component.html](../../projects/angular-utilities/src/table-builder/components/table-container-filter/gen-filter-displayer/gen-filter-displayer.component.html) | Rewrite from a column-picker mat-menu to the chip stack. |
| [components/table-container-filter/gen-filter-displayer/gen-filter-displayer.component.ts](../../projects/angular-utilities/src/table-builder/components/table-container-filter/gen-filter-displayer/gen-filter-displayer.component.ts) | Add inline operator/value editing logic. Subscribe to active filters from `TableStore`. Emit add/edit/remove actions. |
| [components/gen-col-displayer/](../../projects/angular-utilities/src/table-builder/components/gen-col-displayer/) | **Delete** (replaced by columns-panel). |
| [components/sort-menu/](../../projects/angular-utilities/src/table-builder/components/sort-menu/) | **Delete** (replaced by columns-panel). |
| **New:** `components/columns-panel/columns-panel.component.{ts,html,scss,spec.ts}` | The combined zones-with-inline-sort panel. |
| [classes/table-store.ts](../../projects/angular-utilities/src/table-builder/classes/table-store.ts) | Add two new updaters: `cycleColumnSort(key)` and `showColumnAt({key, newOrder})`. **Extend** the existing `hideColumn(key)` (line 70) to also drop the column's sort entry from `state.sorted` — see body in the data model section. All other existing updaters (`setSort`, `setUserDefinedOrder`, `showColumn`, `setHiddenColumns`, `addFilter`, `removeFilter`, `clearFilters`, `cleanPersistedState`) are unchanged. |

### Pre-existing functions to reuse

- **TableStore** — single source of truth for column state. Look at `setColumns`, sort/filter signals.
- **Filter pipeline** — three-layer pipeline per [project_filter_pipeline_architecture memory](file:///C:/Users/yholtzberg/.claude/projects/c--Users-yholtzberg-WebstormProjects-OodleTableBuilder/memory/project_filter_pipeline_architecture.md). Filter chips emit through the existing addFilter/removeFilter/updateFilter actions.
- **`tbCustomFilter` directive** — for advanced filter overrides per column. Unchanged.
- **CDK drag-drop** — already used in the existing show/hide and sort menus. Reuse `cdkDropList` + `cdkDrag`.
- **Material Material 3 system tokens** — direction pill uses `var(--mat-sys-primary)` / `var(--mat-sys-on-primary)` so it stays in theme regardless of consumer's M2/M3 state.

### Example app + docs

- [examples/src/app/table-builder-example/](../../examples/src/app/table-builder-example/) — verify new panels render correctly under the violet/rose M3 theme on `feat/m3-migration-rebased`. Both branches should converge.
- [docs/table-builder-map.md](../../docs/table-builder-map.md) — add a section on the columns-panel architecture (zones, sort independence model).

### Consuming project

PurchaseOrders consumes the library via `@saydar/table-builder`. Once this work merges and is published, PurchaseOrders gets the new panels for free. **No PurchaseOrders changes required** — the public API of `<table-builder>` stays the same; only the internal panels change.

---

## Data model

### Filter chip state — uses existing `FilterInfo` / `CustomFilter` types

The store ([classes/filter-info.ts](../../projects/angular-utilities/src/table-builder/classes/filter-info.ts)) uses two filter shapes, both keyed by `filterId` (UUID generated on add):

```ts
interface FilterState {
  filterId: string;
  filterType: FilterType;
  filterValue?: any;
  active?: boolean;
}

interface FilterInfo<T extends FieldType = any> extends FilterState {
  key: string;            // column key
  fieldType: T;
  _isExternalyManaged?: boolean;
}

interface CustomFilter<T extends FieldType = any> extends FilterState {
  predicate: Predicate<T>;
  filterType: FilterType.Custom;
  // NOTE: no `key` — applies across the row, not to a column
}
```

Filters live in `state.filters: { [filterId: string]: FilterInfo | CustomFilter }`. **A single column can have multiple filters** (separate `filterId`s with the same `key`).

**Chip-rendering rules:**
- **One chip per `filterId`** (NOT per column). If Status has two filters, two Status chips render.
- **`FilterInfo` chip** shows column name (from `metaData[key].displayName`), operator pill (label from `filterType`), value field (bound to `filterValue`), and ✕.
- **`CustomFilter` chip** shows a non-editable label like `<Custom: <description>>` plus an ✕. Operator and value are not editable inline since custom filters carry only a predicate. The chip uses a slightly different style (gray pill, no operator) so users can tell it's read-only.
- **Filter on a hidden column:** filter remains active (filtering is independent of user-visibility). The chip shows a small `visibility_off` icon next to the column name as an affordance ("this filter is active but its column is hidden"). The `+ Add filter` column dropdown lists all columns whose `FieldType` is supported for filtering (i.e., NOT in `UnmappedTypes` — which excludes `FieldType.Hidden`, `FieldType.Expression`, `FieldType.ImageUrl`) and that don't carry the `noFilter` metadata flag. This matches today's column-picker behavior — no regression.

**Operator pill label** comes from a small map per `filterType`: `contains`, `equals` (`=`), `greaterThan` (`>`), `lessThan` (`<`), `between`, `in`, etc. Always violet.


### Store actions used (existing — no new actions for filters)

```ts
addFilter(filter: FilterInfo | CustomFilter)   // assigns filterId if missing
removeFilter(filterId: string)
removeFilters(filterIds: string[])             // for "Clear all"
clearFilters()                                  // for "Clear all" (preferred — atomic)
```

Editing a chip in place is "remove + add" with the same `filterId` reused, so the chip's identity persists.

### Columns-panel state — uses existing TableStore state

Visibility, order, and sort live in three separate slices of `TableState`:

```ts
state.metaData         // Dictionary<MetaData> keyed by column key (source of truth for displayName, fieldType, etc.)
state.hiddenKeys       // string[]              (column keys currently hidden)
state.userDefined.order // Dictionary<number>   (column key → display index)
state.sorted           // Sort[]                (priority by array index — index 0 = priority 1, highest)
```

Where `Sort` is `{ active: string; direction: SortDirection }`.

**Important convention:** `state.sorted[0]` is the **highest-priority** sort. The existing `setSort` updater uses `unshift` (newest → front). The redesign **keeps this convention**: clicking the direction pill on a `none` column makes it priority 1, pushing existing priorities down. (Rationale: matches user intuition of "the thing I just clicked is the most important.") Persisted profile state in localStorage is unaffected — same shape, same semantics.

Panel derivations:
```ts
const hiddenColumns  = Object.values(metaData).filter(m => hiddenKeys.includes(m.key));
const viewableMeta   = orderViewableMetaData(state);    // existing helper, returns visible cols sorted by userDefined.order
const visibleColumns = viewableMeta;                     // top-to-bottom in panel = left-to-right in table
const sortByKey      = new Map(sorted.map((s, i) => [s.active, { direction: s.direction, priority: i + 1 }]));
```

### New action: `cycleColumnSort(key)`

```ts
readonly cycleColumnSort = this.updater((state, key: string) => {
  const idx = state.sorted.findIndex(s => s.active === key);
  if (idx === -1) {
    // none → asc: prepend (priority 1, matches setSort.unshift convention)
    return { ...state, sorted: [{ active: key, direction: SortDirection.asc }, ...state.sorted] };
  }
  if (state.sorted[idx].direction === SortDirection.asc) {
    // asc → desc: same priority slot, don't re-front
    const next = state.sorted.map((s, i) => i === idx ? { ...s, direction: SortDirection.desc } : s);
    return { ...state, sorted: next };
  }
  // desc → none: remove from array (priority gap closes via index shift)
  return { ...state, sorted: state.sorted.filter((_, i) => i !== idx) };
});
```

Three direct paths over `state.sorted`. The asc→desc flip preserves priority slot deliberately (if it went through `setSort`, the column would be re-prepended to priority 1, losing the user's intended ordering).

### Cross-zone drag → store action mapping

The panel translates each drag gesture into atomic store actions. Two new updaters are added to make Hidden→Visible insertions and Visible→Hidden cleanups deterministic and one-shot (no race-prone two-step compositions).

**New updaters on `TableStore`:**

```ts
// Show a hidden column AND place it at a specific index in viewableMetaData,
// in one atomic step. Preserves order entries for OTHER currently-hidden columns
// (only the un-hidden column's order changes; everything else stays put).
readonly showColumnAt = this.updater((state, payload: { key: string; newOrder: number }) => {
  const { key, newOrder } = payload;
  const hiddenKeys = state.hiddenKeys.filter(k => k !== key);

  // Build the new viewable order: take current viewable keys (after un-hiding),
  // remove `key` if present, then splice it in at `newOrder`. splice clamps to length
  // when newOrder > array length — so dropping past the end appends.
  const viewable = orderViewableMetaData({ ...state, hiddenKeys })
    .map(m => m.key)
    .filter(k => k !== key);
  viewable.splice(Math.max(0, Math.min(newOrder, viewable.length)), 0, key);

  // CRITICAL: merge into existing order, don't replace. Other hidden columns
  // (still in hiddenKeys after this update) keep their previous order entries
  // so they re-appear at the same positions if shown again later.
  const newViewableOrder = viewable.reduce((acc, k, i) => {
    acc[k] = i; return acc;
  }, {} as Dictionary<number>);
  const userDefinedOrder = { ...state.userDefined.order, ...newViewableOrder };

  return { ...state, hiddenKeys, userDefined: { ...state.userDefined, order: userDefinedOrder } };
});

// EXTEND existing `hideColumn` (table-store.ts:70). Today it only manages
// `hiddenKeys` (idempotent append, dedupes). Add an atomic sort-entry drop:
// hiding a column should remove it from the sort order so the sort stays
// internally consistent. Filters are NOT touched — filters survive visibility
// changes per the "filter on hidden column" rule.
//
// Updated body:
readonly hideColumn = this.updater((state, key: string) => ({
  ...state,
  hiddenKeys: [...state.hiddenKeys.filter(k => k !== key), key],   // existing: idempotent append
  sorted: state.sorted.filter(s => s.active !== key),               // NEW: drop sort entry
}));
```

**Drag → action mapping:**

| Gesture | Action |
|---|---|
| Drag from Hidden zone → Visible zone (drop at index N) | `showColumnAt({ key, newOrder: N })` — atomic. |
| Drag from Visible zone → Hidden zone | `hideColumn(key)` — atomic. Drops sort entry; filters are preserved. |
| Drag within Visible zone | Existing `setUserDefinedOrder({ oldOrder, newOrder })`. Sort priority is **not** touched. |
| Drag within Hidden zone | No-op (hidden columns have no persisted order — see note below). |

Hidden-column relative ordering is **not** preserved across show/hide cycles. Re-hiding then re-showing puts the column back at the dropped position (per `showColumnAt`'s `newOrder`), not at its previous position. This matches today's behavior.

The existing `setUserDefinedOrder` updater is left as-is — it's still used for the within-Visible case, where its `{newOrder, oldOrder}` semantics over `orderViewableMetaData` are correct.

---

## Error handling and edge cases

- **All columns hidden:** show empty-state message in Visible zone but allow it. Some users want to drag everything out then drag back in. The actual table renders an empty header row in this state — match existing behavior.
- **Sort applied to a column that gets hidden:** drop the sort silently and renumber. No confirmation dialog. (User can drag the column back to restore both the visibility and need to re-click the sort pill.)
- **Drag-drop into the same zone at the same position:** no-op.
- **Filter on a hidden column:** filter stays active (filtering is independent of user-visibility). Chip shows a small `visibility_off` icon next to the column name. `+ Add filter` dropdown lists all filterable columns regardless of visibility — the only filter restriction is by `FieldType` (`UnmappedTypes` are excluded) and the `noFilter` metadata flag. Matches today's behavior; no special hiding-cleanup logic.
- **Custom filters (from `tbCustomFilter` directive):** render as read-only pills (gray, no operator/value editing). Only the ✕ acts on them.
- **Multiple filters per column:** each gets its own chip (one per `filterId`). E.g., two Status filters render two Status chips.
- **Long column names:** ellipsis with `title` attr. Same for filter values.
- **Touch / mobile:** drag-drop falls back to "tap arrow to swap" UI (existing show/hide prototype already supports this).

---

## Testing

Per memory `project_testing_strategy.md`, Playwright e2e tests are the primary suite. Required tests:

### Filter panel (`filter-panel.e2e.spec.ts`)
- Open filter panel → see existing filters as chips
- Click `+ Add filter` → column picker → operator → value → chip appears
- Click operator pill on existing chip → operator dropdown
- Click ✕ on chip → filter removes immediately
- Click `Clear all` → all chips removed, undo banner shown
- **Click undo banner** → all filters restored with original `filterId`s, chips reappear
- Operator pill renders violet for both `contains` (long) and `=` (single char) — assert computed background color matches `--mat-sys-primary`
- **Empty state:** with zero filters, panel shows centered "No filters applied" + `+ Add filter` pill; click it expands the new-chip row
- **Multiple filters per column:** add two filters on Status with different operators → two chips render with the correct values
- **Custom filter rendering:** with a `tbCustomFilter` directive applied, panel shows a gray non-editable pill; clicking ✕ removes the custom filter; clicking the pill body does NOT open an editor
- **Filter dropdown contents:** `+ Add filter` lists all columns whose `FieldType` is in the filterable set (NOT `Hidden`/`Expression`/`ImageUrl`) and that don't carry `noFilter` — regardless of whether the column is currently user-hidden. Verify a user-hidden column is still in the dropdown; verify a `FieldType.Hidden` column is NOT.
- **Filter survives column hiding:** add a filter on Status, then hide Status from the columns panel → chip remains, with a small `visibility_off` icon next to the column name. Filter still active in the table (verify row count).
- **Custom filter unaffected by hiding:** with a `tbCustomFilter` directive applied → custom filter chip stays regardless of any column visibility changes

### Columns panel (`columns-panel.e2e.spec.ts`)
- Open columns panel → see Hidden/Visible zones with current state
- Drag column from Hidden to Visible at a specific index → column appears at that exact position in the table (verify by reading rendered headers in left-to-right order). Asserts `showColumnAt` is correct.
- Drag column from Visible to Hidden → column disappears from table; if it had a sort applied, sort entry is dropped atomically; filters on that column survive (chip gains the `visibility_off` icon). Asserts `hideColumn` is correct.
- **`showColumnAt` preserves other hidden columns' order:** with three columns hidden (A, B, C) and known order entries, drag B back into Visible → A's and C's `userDefined.order` entries are preserved unchanged
- **`showColumnAt` clamps `newOrder`:** drag a column into Visible with `newOrder` greater than current viewable length → column lands at the end (no error)
- Drag within Visible → table column order changes (verify by reading rendered headers)
- Click direction pill on `none` column → cycles to `asc`, priority badge `1` appears
- Click direction pill on `asc` column → cycles to `desc`, priority badge unchanged
- Click direction pill on `desc` column → cycles to `none`, priority badge disappears
- Multiple sorts: clicking sort on three different `none` columns in sequence → newest click is priority 1 (others shift down)
- Drag a sorted column to Hidden → sort silently drops, priority gap closes, remaining priorities renumber from 1
- **Drag-back doesn't restore sort:** drag a sorted column to Hidden then back to Visible → column reappears with sort = none (not the previous direction). Asserts no auto-restore.
- **Persisted-state migration:** load a saved profile from the previous Apply-gated era (with a populated `state.sorted` array) → panel renders the existing priorities correctly under the new model (no Apply button required, sort applies on open)
- **All-columns-hidden state:** drag every column to Hidden → table renders empty header row (existing behavior); panel still functional
- **Empty Visible zone state:** matches the all-hidden case; panel shows "No columns visible — add at least one"
- Touch fallback: with mouse simulated as touch, drag-drop still works OR the click-arrow path triggers zone-swap

### Cross-panel
- Existing PurchaseOrders bug-verification pages (per CLAUDE.md) should still work. Specifically:
  - Pending Allocation (VS table with group-by)
  - Approved Customers (non-VS, group by name)
  - In-Development Products (group by Vendor — known broken-on-main bug stays broken; new panels shouldn't make it worse)
- **Saved profile compatibility:** load each PurchaseOrders test page that has a saved view profile from the old menus → panels render the saved state correctly without errors

---

## Out of scope

- **Column pinning (sticky-left/right).** Tempting to add pin controls to the columns panel rows, but it requires backend support for `position: sticky` on cells which is non-trivial. Track separately.
- **Saved view profiles.** Already exists in the existing `headerMenuExtra` (Save / Choose Profile). Not touched by this redesign.
- **Filter validation (typed inputs).** Today the value field is a plain text input regardless of column data type. Date pickers, number steppers, etc. are a separate enhancement.
- **Mobile-specific layout.** The drag-drop fallback works on touch, but a redesigned mobile-first layout (full-screen sheets) is not in scope.
- **Filter language parser** (e.g., type "status:approved" to add a filter). Powerful but out of scope.

---

## Verification

After implementation:
1. Run `ng build AngularUtilities` — clean.
2. Run example app (`ng serve AngularUrilitiesExamples`); verify Oodle Table example renders the new filter chips and columns panel correctly under the M3 violet/rose theme.
3. Run Playwright e2e — all existing tests pass + new tests for the two redesigned panels.
4. Build PurchaseOrders against a local-linked dist; smoke-test the bug-verification pages from CLAUDE.md.
5. **Don't publish to npm** until reviewed and explicit go-ahead per `feedback_ask_before_commit.md`.
