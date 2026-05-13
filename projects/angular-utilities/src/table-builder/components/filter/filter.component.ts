import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { filterTypeMap, FilterInfo, UnmappedTypes, mappedFieldTypes, PartialFilter } from '../../classes/filter-info';
import { TableStore } from '../../classes/table-store';
import { FilterType } from '../../enums/filterTypes';
import { FieldType } from '../../interfaces/report-def';


type thingy = Omit<FieldType, UnmappedTypes>

@Component({
  selector: 'tb-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class FilterComponent<T extends mappedFieldTypes = any> {
  filterTypes = filterTypeMap;
  FilterType = FilterType;
  FieldType = FieldType;
  @Input() filter!: PartialFilter;;
  @Output() close = new EventEmitter();
  currentFilterType?: FilterType;
  /** Mirror of filter.filterValue for boolean / IsNull toggles. The hidden input
   * keeps it in sync with the template-driven form so `form.value.filterValue`
   * reflects the user's toggle pick on Apply. */
  currentFilterValue: any;
  constructor(public state: TableStore) { }

  ngOnInit() {
    this.currentFilterType = this.filter.filterType;
    this.currentFilterValue = this.filter.filterValue;
  }

  setFilterValue(v: any) {
    this.currentFilterValue = v;
  }
  onEnter(filter: FilterInfo, event: any) {
    event.preventDefault();
    if (filter.filterValue != null && filter.filterType) {
      this.state.addFilter(filter);
      this.close.emit();
    }
  }
}
