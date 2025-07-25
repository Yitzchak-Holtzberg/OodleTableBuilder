import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PartialFilter } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
    selector: 'tb-date-time-filter',
    templateUrl: './date-time-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../filter/filter.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    standalone: false
})
export class DateTimeFilterComponent {
  FilterType = FilterType;
  @Input() info!: PartialFilter;
  @Input() CurrentFilterType!: FilterType;
}
