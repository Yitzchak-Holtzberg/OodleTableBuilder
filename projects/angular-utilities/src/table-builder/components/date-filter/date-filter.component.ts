import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PartialFilter } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
    selector: 'tb-date-filter',
    templateUrl: './date-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../filter/filter.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    standalone: false
})
export class DateFilterComponent {
    FilterType = FilterType;
    @Input() info!: PartialFilter;
    @Input() CurrentFilterType!: FilterType;
}
