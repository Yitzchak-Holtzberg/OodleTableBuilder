import { Component, Input, ChangeDetectionStrategy, input } from '@angular/core';
import { FilterType } from '../../enums/filterTypes';
import { ControlContainer, NgForm, FormsModule } from '@angular/forms';
import { PartialFilter } from '../../classes/filter-info';
import { FieldType } from '../../interfaces/report-def';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { InFilterComponent } from '../in-filter/in-filter.component';


@Component({
    selector: 'tb-number-filter',
    templateUrl: './number-filter.component.html',
    styleUrls: ['./number-filter.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    imports: [MatFormField, MatInput, FormsModule, InFilterComponent]
})
export class NumberFilterComponent {
  FilterType = FilterType; FieldType = FieldType;
  readonly CurrentFilterType = input.required<FilterType>();
  @Input() info!:PartialFilter;
}
