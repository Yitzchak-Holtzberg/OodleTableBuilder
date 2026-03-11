import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { PartialFilter } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { ControlContainer, NgForm, FormsModule } from '@angular/forms';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';

@Component({
    selector: 'tb-date-filter',
    templateUrl: './date-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../filter/filter.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    imports: [MatFormField, MatInput, FormsModule, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker]
})
export class DateFilterComponent {
    FilterType = FilterType;
    readonly info = input.required<PartialFilter>();
    readonly CurrentFilterType = input.required<FilterType>();
}
