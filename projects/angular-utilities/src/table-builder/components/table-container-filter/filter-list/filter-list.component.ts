import { Component } from '@angular/core';
import { TableStore } from '../../../classes/table-store';
import { CustomFilter, FilterInfo, isFilterInfo } from '../../../classes/filter-info';
import { map } from 'rxjs/operators';
import { WrapperFilterStore } from '../table-wrapper-filter-store';
import { Observable } from 'rxjs';
import { FieldType } from '../../../interfaces/report-def';

@Component({
    selector: 'lib-filter-list',
    templateUrl: './filter-list.component.html',
    styleUrls: ['../gen-filter-displayer/gen-filter-displayer.component.css'],
    standalone: false
})
export class FilterChipsComponent {
  isArray = Array.isArray;

  /** Show this many values inline before collapsing a multi-value filter into a
   *  single "{n} values" pill that expands on click. Keeps the chip row from
   *  growing wide enough to cover the header's export menu. */
  readonly maxInlinePills = 3;

  /** filterIds whose multi-value pill list is currently expanded inline. */
  private readonly expandedFilterIds = new Set<string>();

  constructor( public tableState: TableStore, private filterStore : WrapperFilterStore) {
  }

  toggleExpanded(filterId: string) {
    if (this.expandedFilterIds.has(filterId)) {
      this.expandedFilterIds.delete(filterId);
    } else {
      this.expandedFilterIds.add(filterId);
    }
  }

  isExpanded(filterId: string): boolean {
    return this.expandedFilterIds.has(filterId);
  }

  /** Identifies the single value being edited inline within the dropdown
   *  (`${filterId}#${index}`). Inline editing happens per-value inside the
   *  expanded menu — not at the chip level. */
  editingValueKey: string | null = null;

  /** Field types whose value is plain text we can safely edit inline as a string. */
  private static readonly TEXT_FIELD_TYPES = [
    FieldType.String, FieldType.Array, FieldType.Unknown, FieldType.PhoneNumber, FieldType.Link,
  ];

  isInlineEditable(filter: FilterInfo<any>): boolean {
    return FilterChipsComponent.TEXT_FIELD_TYPES.includes(filter.fieldType);
  }

  private valueKey(filterId: string | undefined, index: number): string {
    return `${filterId}#${index}`;
  }

  isEditingValue(filterId: string | undefined, index: number): boolean {
    return !!filterId && this.editingValueKey === this.valueKey(filterId, index);
  }

  /** Double-click a value row in the dropdown to edit just that value inline. */
  startValueEdit(filter: FilterInfo<any>, index: number) {
    if (!this.isInlineEditable(filter)) return;
    this.editingValueKey = this.valueKey(filter.filterId, index);
    // focus the freshly-rendered input (only one is ever open at a time)
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>('lib-filter-list .fp-edit-input');
      el?.focus();
      el?.select();
    });
  }

  /** Commit an edited value back into the multi-value filter. An empty value drops
   *  it; if none remain the filter is removed entirely. */
  commitValueEdit(filter: FilterInfo<any>, pills: string[], index: number, raw: string) {
    if (this.editingValueKey !== this.valueKey(filter.filterId, index)) return; // stale
    this.editingValueKey = null;
    const next = [...pills];
    const trimmed = raw.trim();
    if (!trimmed) {
      next.splice(index, 1);
    } else {
      next[index] = trimmed;
    }
    if (next.length === 0) {
      this.tableState.removeFilter(filter.filterId!);
      return;
    }
    this.tableState.addFilter({ ...filter, filterValue: next.length === 1 ? next[0] : next.join(', ') });
  }

  cancelEdit() {
    this.editingValueKey = null;
  }

  /** Remove a single value from a multi-value filter, re-applying the filter with
   *  the remaining values (or removing it entirely if none are left). `pills` is
   *  the already-split value list for this filter. */
  removeValue(filter: FilterInfo<any>, pills: string[], value: string) {
    const remaining = pills.filter(v => v !== value);
    if (remaining.length === 0) {
      this.tableState.removeFilter(filter.filterId!);
      return;
    }
    this.tableState.addFilter({
      ...filter,
      filterValue: remaining.length === 1 ? remaining[0] : remaining.join(', '),
    });
  }

    filters$: Observable<FilterInfo<any>[]> = this.tableState.filters$.pipe(
      map( filters => Object.values(filters)
                        .filter(isFilterInfo)
                        .filter( f => !f._isExternalyManaged)
      )
    );

    deleteByIndex(index: number) {
      this.filterStore.deleteByIndex(index);
    }

    addFilter(filter:FilterInfo<any>){
      this.filterStore.addFilter(filter);
    }

    clearAll() {
        this.filterStore.clearAll();
    }

    currentFilters$ = this.filterStore.currentFilters$;
}
