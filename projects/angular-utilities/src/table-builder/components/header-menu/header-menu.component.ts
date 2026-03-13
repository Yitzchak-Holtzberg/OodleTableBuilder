import { ChangeDetectionStrategy, Component, input, viewChild, inject } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { FilterType } from '../../enums/filterTypes';
import { FilterInfo } from '../../classes/filter-info';
import { TableStore } from '../../classes/table-store';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { InListFilterComponent } from '../filter/in-list/in-list-filter.component';
import { MatFormField, MatPrefix, MatLabel, MatSuffix } from '@angular/material/form-field';
import { StopPropagationDirective } from '../../../utilities/directives/stop-propagation.directive';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';

@Component({
    selector: 'tb-header-menu',
    templateUrl: './header-menu.component.html',
    styleUrls: ['./header-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, FormsModule, InListFilterComponent, MatFormField, StopPropagationDirective, MatPrefix, MatLabel, MatInput, MatSuffix, MatTooltip, NgClass, MatRadioGroup, MatRadioButton, MatDatepickerInput, MatDatepickerToggle, MatDatepicker, MatButton]
})
export class HeaderMenuComponent {
  tableState = inject(TableStore);

  FieldType = FieldType;
  FilterType = FilterType;
  myFilterType!: FilterType;
  myFilterValue: any;

  readonly filter = input.required<Partial<FilterInfo>>();

  readonly metaData = input.required<MetaData>();
  readonly trigger = viewChild.required(MatMenuTrigger);

  hideField(key: string) {
    this.tableState.hideColumn(key);
  }

  ngOnInit() {
    this.resetFilterType();
  }

  resetFilterType() {
    const metaData = this.metaData();
    if(metaData.additional?.filterOptions?.filterableValues) {
      this.myFilterType = FilterType.In;
      return;
    }
    switch (metaData.fieldType) {
      case FieldType.String:
      case FieldType.Link:
      case FieldType.PhoneNumber:
      case FieldType.Array:
      case FieldType.Unknown:
        this.myFilterType = FilterType.StringContains;
        break;
      case FieldType.Currency:
      case FieldType.Number:
        this.myFilterType = FilterType.NumberEquals;
        break;
      case FieldType.Boolean:
          this.myFilterType = FilterType.BooleanEquals;
          break;
      case FieldType.Date:
      case FieldType.DateTime:
          this.myFilterType = FilterType.DateIsOn;
          break;
      case FieldType.Enum:
        this.myFilterType = FilterType.In;
        break;
    }
  }

  setStringFilterType() {
    this.myFilterType = this.myFilterType === FilterType.StringContains ? FilterType.StringDoesNotContain : FilterType.StringContains;
  }

  setFilterType(filterType: FilterType) {
    if (filterType === this.myFilterType) {
      this.resetFilterType();
    } else {
      this.myFilterType = filterType;
    }
  }

  onEnter(filter: FilterInfo) {
    if (filter.filterValue != undefined && filter.filterType) {
      this.tableState.addFilter(filter);
      this.trigger().closeMenu();
    }
  }
}
