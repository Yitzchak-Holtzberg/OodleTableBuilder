import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { PartialFilter } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { ControlContainer, NgForm, FormsModule } from '@angular/forms';

@Component({
    selector: 'tb-date-time-filter',
    templateUrl: './date-time-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../filter/filter.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    imports: [FormsModule]
})
export class DateTimeFilterComponent {
  FilterType = FilterType;
  readonly info = input.required<PartialFilter>();
  readonly CurrentFilterType = input.required<FilterType>();
}
