import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { filterTypeMap, FilterInfo, UnmappedTypes, mappedFieldTypes, PartialFilter } from '../../classes/filter-info';
import { TableStore } from '../../classes/table-store';
import { FilterType } from '../../enums/filterTypes';
import { FieldType } from '../../interfaces/report-def';
import { NgTemplateOutlet, KeyValuePipe } from '@angular/common';
import { MatCard, MatCardContent } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatSelect, MatOption } from '@angular/material/select';
import { NumberFilterComponent } from '../number-filter/number-filter.component';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { DateTimeFilterComponent } from '../date-time-filter/date-time-filter.component';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatInput } from '@angular/material/input';
import { InFilterComponent } from '../in-filter/in-filter.component';
import { InListFilterComponent } from './in-list/in-list-filter.component';
import { SpaceCasePipe } from '../../../utilities/pipes/space-case.pipes';


type thingy = Omit<FieldType,UnmappedTypes>

@Component({
    selector: 'tb-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCard, MatCardContent, FormsModule, MatIconButton, MatTooltip, MatIcon, MatFormField, MatSelect, MatOption, NgTemplateOutlet, NumberFilterComponent, DateFilterComponent, DateTimeFilterComponent, MatRadioGroup, MatRadioButton, MatButton, MatInput, InFilterComponent, InListFilterComponent, KeyValuePipe, SpaceCasePipe]
})
export class FilterComponent<T extends mappedFieldTypes = any> {
  filterTypes = filterTypeMap;
  FilterType = FilterType;
  FieldType = FieldType;
  @Input() filter!: PartialFilter;;
  @Output() close = new EventEmitter();
  currentFilterType?: FilterType;
  constructor( public state: TableStore) { }

  ngOnInit() {
    this.currentFilterType = this.filter.filterType;
  }
  onEnter(filter: FilterInfo, event: any) {
    event.preventDefault();
    if (filter.filterValue != null && filter.filterType) {
      this.state.addFilter(filter);
      this.close.emit();
    }
  }
}
