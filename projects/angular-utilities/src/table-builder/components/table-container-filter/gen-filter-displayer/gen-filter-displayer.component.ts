import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { TableStore } from '../../../classes/table-store';
import {
  CustomFilter, FilterInfo, filterTypeMap, isCustomFilter, isFilterInfo, mappedFieldTypes
} from '../../../classes/filter-info';
import { FieldType, MetaData } from '../../../interfaces/report-def';
import { WrapperFilterStore } from '../table-wrapper-filter-store';
import { FilterType } from '../../../enums/filterTypes';

interface FilterChipVm {
  filterId: string;
  columnName: string;
  columnKey: string;
  filterType: FilterType | undefined;
  fieldType: FieldType;
  operatorLabel: string;
  /** Display string of the filter value. Arrays are joined with ", " so the user can edit them as text. */
  valueDisplay: string;
  /** Raw filterValue (used for type-aware inputs in expanded form). */
  rawValue: any;
  isCustom: boolean;
  isHidden: boolean;
}

/** Editing draft state for the currently-expanded chip. Edits don't commit until Apply. */
interface ChipDraft {
  filterId: string;
  filterType: FilterType | undefined;
  value: any;
  /** True if this draft was just created from "+ Add filter" — Cancel removes the chip entirely. */
  isNew: boolean;
}

// FilterType is a string-valued enum where some entries share string values
// (e.g. NumberEquals === StringEquals === 'Equals', NumberBetween === DateBetween === 'Between').
// We dedupe by string value when building this lookup.
const OPERATOR_LABELS: Record<string, string> = {
  [FilterType.StringContains]: 'contains',
  [FilterType.StringDoesNotContain]: 'not contains',
  [FilterType.StringEquals]: 'equals',
  [FilterType.StringStartWith]: 'starts with',
  [FilterType.StringEndsWith]: 'ends with',
  [FilterType.NumberNotEqual]: '≠',
  [FilterType.NumberLessThan]: '<',
  [FilterType.NumberGreaterThan]: '>',
  [FilterType.NumberBetween]: 'between',
  [FilterType.DateIsOn]: 'on',
  [FilterType.DateIsNotOn]: 'not on',
  [FilterType.DateOnOrAfter]: 'on or after',
  [FilterType.DateOnOrBefore]: 'on or before',
  [FilterType.DateTimeIsAt]: 'at',
  [FilterType.DateTimeIsNotAt]: 'not at',
  [FilterType.DateTimeAtOrAfter]: 'at or after',
  [FilterType.DateTimeAtOrBefore]: 'at or before',
  [FilterType.BooleanEquals]: 'is',
  [FilterType.IsNull]: 'is empty',
  [FilterType.In]: 'in',
  [FilterType.Or]: 'or',
  [FilterType.And]: 'and',
  [FilterType.Custom]: 'custom',
};

@Component({
  selector: 'tb-filter-displayer',
  templateUrl: './gen-filter-displayer.component.html',
  styleUrls: ['./gen-filter-displayer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GenFilterDisplayerComponent {
  chips$: Observable<FilterChipVm[]>;
  filterCols$: Observable<MetaData[]>;
  count$: Observable<number>;

  /** Which chip is currently in expanded form. Drives compact vs expanded rendering. */
  draft = signal<ChipDraft | null>(null);

  /** Whether the inline column picker is open (replaces the nested mat-menu so the
   * parent panel stays open after a column is selected). */
  pickerOpen = signal(false);

  /** Expose FilterType to the template so it can compare against d.filterType. */
  protected readonly FilterType = FilterType;

  constructor(public tableState: TableStore, public filterStore: WrapperFilterStore) {
    this.filterCols$ = tableState.metaDataArray$.pipe(
      map(md => Object.values(md).filter(m => m.fieldType !== FieldType.Hidden && !m.noFilter))
    );

    this.chips$ = combineLatest([this.tableState.filters$, this.tableState.metaData$]).pipe(
      map(([filters, metaData]) =>
        Object.values(filters)
          .filter((f): f is FilterInfo | CustomFilter => !!f)
          .filter(f => !(isFilterInfo(f) && (f as FilterInfo)._isExternalyManaged))
          .map<FilterChipVm>(f => {
            if (isCustomFilter(f)) {
              return {
                filterId: f.filterId,
                columnName: 'Custom',
                columnKey: '',
                filterType: f.filterType,
                fieldType: FieldType.Unknown,
                operatorLabel: 'custom',
                valueDisplay: '',
                rawValue: undefined,
                isCustom: true,
                isHidden: false,
              };
            }
            const key = (f as FilterInfo).key;
            const meta = metaData[key];
            const display = meta?.displayName || this.spaceCase(key);
            return {
              filterId: f.filterId,
              columnName: display,
              columnKey: key,
              filterType: f.filterType,
              fieldType: (f as FilterInfo).fieldType,
              operatorLabel: f.filterType === FilterType.IsNull
                ? ((f as FilterInfo).filterValue ? 'is empty' : 'is not empty')
                : (f.filterType ? (OPERATOR_LABELS[f.filterType] || f.filterType) : 'select'),
              valueDisplay: this.formatValue((f as FilterInfo).filterValue),
              rawValue: (f as FilterInfo).filterValue,
              isCustom: false,
              isHidden: meta ? meta.fieldType === FieldType.Hidden : false,
            };
          })
      )
    );

    this.count$ = this.chips$.pipe(map(chips => chips.length));
  }

  /** Operators compatible with a chip's column fieldType, for the operator dropdown. */
  operatorsFor(fieldType: FieldType): { value: FilterType; label: string }[] {
    if (fieldType === FieldType.Hidden || fieldType === FieldType.Expression || fieldType === FieldType.ImageUrl) {
      return [];
    }
    const map = filterTypeMap[fieldType as mappedFieldTypes];
    if (!map) return [];
    return Object.keys(map).map(ft => ({
      value: ft as FilterType,
      label: OPERATOR_LABELS[ft] || ft,
    }));
  }

  /** Maps fieldType to the input style the expanded form should render. */
  inputKindFor(fieldType: FieldType): 'date' | 'datetime' | 'number' | 'boolean' | 'text' {
    switch (fieldType) {
      case FieldType.Date: return 'date';
      case FieldType.DateTime: return 'datetime';
      case FieldType.Number:
      case FieldType.Currency: return 'number';
      case FieldType.Boolean: return 'boolean';
      default: return 'text';
    }
  }

  /**
   * Add a new filter from the column picker.
   * Combo 4: the chip is born expanded with no value yet. The user fills in value + Apply
   * to commit. Commits to TableStore happen on Apply, not on every keystroke, so the
   * table doesn't re-filter mid-edit.
   */
  /** Toggle the inline column picker. */
  togglePicker(event?: Event) {
    if (event) event.stopPropagation();
    this.pickerOpen.update(v => !v);
  }

  closePicker() {
    this.pickerOpen.set(false);
  }

  addFilter(metaData: MetaData) {
    const ops = this.operatorsFor(metaData.fieldType);
    const defaultType = ops.length ? ops[0].value : undefined;
    const filterId = uuid();
    // IsNull's filterValue is a boolean direction (true=blanks, false=non-blanks).
    // For Enum fields the default operator IS IsNull, so set filterValue=true upfront
    // so the placeholder chip reads "is empty" instead of "is not empty" during the
    // brief window before Apply.
    const placeholderValue = defaultType === FilterType.IsNull ? true : undefined;
    // Insert a placeholder filter so the chip renders. With filterValue: undefined,
    // createFilterFunc returns defaultPredicate (everything matches) — no table change.
    this.tableState.addFilter({
      filterId,
      key: metaData.key,
      fieldType: metaData.fieldType,
      filterType: defaultType,
      filterValue: placeholderValue,
    } as FilterInfo);
    // Open the expanded form for editing and close the column picker.
    this.draft.set({
      filterId,
      filterType: defaultType,
      value: defaultType === FilterType.IsNull ? true : this.defaultDraftValue(metaData.fieldType),
      isNew: true,
    });
    this.pickerOpen.set(false);
  }

  /** Open the expanded form for an existing chip. Initializes the draft from current values. */
  expand(chip: FilterChipVm) {
    if (chip.isCustom) return;
    this.draft.set({
      filterId: chip.filterId,
      filterType: chip.filterType,
      value: chip.rawValue ?? this.defaultDraftValue(chip.fieldType),
      isNew: false,
    });
  }

  /**
   * NumberBetween, DateBetween, and DateTimeBetween all have the same string enum value
   * ('Between'). We check against any one of them and the comparison covers all three.
   */
  protected isBetween(ft: FilterType | undefined): boolean {
    return ft === FilterType.NumberBetween;
  }

  /** Update the operator in the draft (without committing). */
  draftSetOperator(filterType: FilterType, fieldType: FieldType) {
    const d = this.draft();
    if (!d) return;
    // Switching to/from a Between operator changes the value shape — primitive vs
    // {Start, End} Range. Reset the value to the appropriate default so we don't
    // hand a primitive to the between filter (or vice versa) on Apply.
    const wasBetween = this.isBetween(d.filterType);
    const willBeBetween = this.isBetween(filterType);
    const wasIsNull = d.filterType === FilterType.IsNull;
    const willBeIsNull = filterType === FilterType.IsNull;
    let value = d.value;
    if (wasBetween !== willBeBetween || wasIsNull !== willBeIsNull) {
      // Three shapes: Range {Start,End} for Between, boolean for IsNull, primitive otherwise.
      if (willBeBetween) {
        value = { Start: this.defaultDraftValue(fieldType), End: this.defaultDraftValue(fieldType) };
      } else if (willBeIsNull) {
        value = true; // default to "match blanks" — same as legacy filter dialog's default
      } else {
        value = this.defaultDraftValue(fieldType);
      }
    }
    this.draft.set({ ...d, filterType, value });
  }

  /** Update the value in the draft (without committing). */
  draftSetValue(value: any) {
    const d = this.draft();
    if (!d) return;
    this.draft.set({ ...d, value });
  }

  /** Update the Start side of a Between range draft (without committing). */
  draftSetStart(start: any) {
    const d = this.draft();
    if (!d) return;
    const range = (d.value && typeof d.value === 'object') ? d.value : {};
    this.draft.set({ ...d, value: { ...range, Start: start } });
  }

  /** Update the End side of a Between range draft (without committing). */
  draftSetEnd(end: any) {
    const d = this.draft();
    if (!d) return;
    const range = (d.value && typeof d.value === 'object') ? d.value : {};
    this.draft.set({ ...d, value: { ...range, End: end } });
  }

  /** Apply: commit the draft to TableStore, collapse. */
  apply(chip: FilterChipVm) {
    const d = this.draft();
    if (!d || d.filterId !== chip.filterId) return;
    const value = this.parseDraftValue(d.value, chip.fieldType, d.filterType);
    this.tableState.addFilter({
      filterId: d.filterId,
      key: chip.columnKey,
      fieldType: chip.fieldType,
      filterType: d.filterType,
      filterValue: value,
    } as FilterInfo);
    this.draft.set(null);
  }

  /** Cancel: collapse without committing. For new chips, also remove the placeholder. */
  cancel(chip: FilterChipVm) {
    const d = this.draft();
    if (!d || d.filterId !== chip.filterId) return;
    if (d.isNew) {
      this.tableState.removeFilter(chip.filterId);
    }
    this.draft.set(null);
  }

  removeFilter(filterId: string) {
    if (this.draft()?.filterId === filterId) {
      this.draft.set(null);
    }
    this.tableState.removeFilter(filterId);
  }

  clearAll() {
    this.draft.set(null);
    this.tableState.clearFilters();
  }

  trackByFilterId(_: number, chip: FilterChipVm) {
    return chip.filterId;
  }

  trackByKey(_: number, md: MetaData) {
    return md.key;
  }

  /** True when the chip is currently the one being edited (expanded). */
  isExpanded(filterId: string): boolean {
    return this.draft()?.filterId === filterId;
  }

  // -------- internal helpers --------

  private defaultDraftValue(fieldType: FieldType): any {
    switch (fieldType) {
      case FieldType.Boolean: return true;
      case FieldType.Number:
      case FieldType.Currency: return null;
      default: return '';
    }
  }

  /** Parse the draft's loosely-typed value into something filterValue-compatible. */
  private parseDraftValue(raw: any, fieldType: FieldType, ft: FilterType | undefined): any {
    // FilterType.IsNull is overloaded: filterValue is a *boolean* indicating direction.
    // true = match rows where the column is blank/null; false = match non-blank rows.
    // The V3-A dialog renders a True/False toggle when IsNull is selected; we coerce
    // the draft's value here. Default to true if somehow undefined slips through, so
    // the filter is never inert when the user picked IsNull.
    if (ft === FilterType.IsNull) {
      return raw === false || raw === 'false' ? false : true;
    }

    // Between operators (NumberBetween, DateBetween, DateTimeBetween) take a Range
    // {Start, End}. The draft holds an object with each side parsed independently
    // through the same coercion logic as a single primitive value.
    if (this.isBetween(ft)) {
      if (!raw || typeof raw !== 'object') return undefined;
      const start = this.parseDraftValue(raw.Start, fieldType, undefined);
      const end = this.parseDraftValue(raw.End, fieldType, undefined);
      if (start === undefined || end === undefined) return undefined;
      return { Start: start, End: end };
    }

    if (raw === '' || raw === null || raw === undefined) return undefined;
    if (ft === FilterType.In && typeof raw === 'string') {
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (fieldType === FieldType.Number || fieldType === FieldType.Currency) {
      const n = typeof raw === 'number' ? raw : parseFloat(raw);
      return isNaN(n) ? undefined : n;
    }
    if (fieldType === FieldType.Date || fieldType === FieldType.DateTime) {
      // <input type="date"> gives "YYYY-MM-DD"; pass through. The filter pipeline
      // already handles string-or-Date comparisons elsewhere.
      return raw;
    }
    if (fieldType === FieldType.Boolean) {
      return raw === true || raw === 'true';
    }
    return raw;
  }

  private formatValue(v: any): string {
    if (v == null) return '';
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object' && v.Start !== undefined && v.End !== undefined) {
      return `${v.Start} – ${v.End}`;
    }
    return String(v);
  }

  /** Approximate the SpaceCase pipe locally so chip labels match the rest of the UI. */
  private spaceCase(s: string): string {
    if (!s) return '';
    return s
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
