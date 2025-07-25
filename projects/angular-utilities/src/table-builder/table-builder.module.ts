
import { NgModule } from '@angular/core';
import { GenericTableComponent, GenericTableVsComponent } from './components/generic-table/generic-table.component';
import { CustomCellDirective } from './directives/custom-cell-directive';
import { GenColDisplayerComponent } from './components/gen-col-displayer/gen-col-displayer.component';
import { GenFilterDisplayerComponent } from './components/table-container-filter/gen-filter-displayer/gen-filter-displayer.component';
import { FilterComponent } from './components/filter/filter.component';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpaceCasePipe } from '../utilities/pipes/space-case.pipes';
import { MaterialModule } from './material.module';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { TableContainerComponent } from './components/table-container/table-container';
import { ColumnTotalPipe } from './pipes/column-total.pipe';
import { MultiSortDirective } from './directives/multi-sort.directive';
import { ColumnBuilderComponent } from './components/column-builder/column-builder.component';
import { ModuleWithProviders } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './classes/TableBuilderConfig';
import { NumberFilterComponent } from './components/number-filter/number-filter.component';
import { StoreModule } from '@ngrx/store';
import { storageStateReducer } from './ngrx/reducer';
import { HeaderMenuComponent } from './components/header-menu/header-menu.component';
import { EffectsModule } from '@ngrx/effects';
import { SaveTableEffects } from './ngrx/effects';
import { KeyDisplayPipe } from './pipes/key-display';
import { PhoneNumberPipe } from '../utilities/pipes/phone.pipe';
import { RouterModule } from '@angular/router';
import { ArrayColumnComponent } from './components/array-column.component';
import { LinkColumnComponent } from './components/link-column.component';
import { InFilterComponent } from './components/in-filter/in-filter.component';
import { FormatFilterValuePipe } from './pipes/format-filter-value.pipe';
import { FormatFilterTypePipe } from './pipes/format-filter-type.pipe';
import { ResizeColumnDirective } from './directives/resize-column.directive';
import {LetDirective} from '@ngrx/component'
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InitializationComponent } from './components/initialization-component/initialization-component';
import { InListFilterComponent } from './components/filter/in-list/in-list-filter.component';
import { SortMenuComponent } from './components/sort-menu/sort-menu.component';
import { FilterChipsComponent } from './components/table-container-filter/filter-list/filter-list.component';
import { PaginatorComponent } from './components/generic-table/paginator.component';
import { UtilitiesModule } from '../utilities';
import {
  MatButtonToggleFilterDirective,
  MatCheckboxTbFilterDirective,
  MatOptionTbFilterDirective,
  MatRadioButtonTbFilterDirective,
  MatSlideToggleTbFilterDirective,
  TableFilterDirective,
  TableFilterStringContainsDirective,
} from './directives';
import { TableWrapperDirective } from './directives/table-wrapper.directive';
import { GroupByListComponent } from './components/group-by-list/group-by-list.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { DateTimeFilterComponent } from './components/date-time-filter/date-time-filter.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    StoreModule.forFeature('globalStorageState', storageStateReducer),
    EffectsModule.forFeature([SaveTableEffects]),
    FormsModule,
    RouterModule,
    LetDirective,
    DragDropModule,
    UtilitiesModule,
    ScrollingModule,
    TableVirtualScrollModule,
  ],
    exports: [
        GenericTableComponent,
        GenericTableVsComponent,
        PaginatorComponent,
        TableContainerComponent,
        CustomCellDirective,
        GenColDisplayerComponent,
        GenFilterDisplayerComponent,
        FilterComponent,
        MultiSortDirective,
        ResizeColumnDirective,
        MatSlideToggleTbFilterDirective,
        MatRadioButtonTbFilterDirective,
        MatOptionTbFilterDirective,
        MatCheckboxTbFilterDirective,
        MatButtonToggleFilterDirective,
        TableFilterDirective,
        TableFilterStringContainsDirective,
        TableWrapperDirective,
        GroupByListComponent,
    ],
    declarations: [
        ColumnTotalPipe,
        TableContainerComponent,
        GenericTableComponent,
        GenericTableVsComponent,
        PaginatorComponent,
        CustomCellDirective,
        GenColDisplayerComponent,
        GenFilterDisplayerComponent,
        DateFilterComponent,
        FilterComponent,
        MultiSortDirective,
        NumberFilterComponent,
        ColumnBuilderComponent,
        ArrayColumnComponent,
        LinkColumnComponent,
        HeaderMenuComponent,
        KeyDisplayPipe,
        FormatFilterValuePipe,
        FormatFilterTypePipe,
        ResizeColumnDirective,
        InFilterComponent,
        InitializationComponent,
        InListFilterComponent,
        SortMenuComponent,
        FilterChipsComponent,
        MatSlideToggleTbFilterDirective,
        MatRadioButtonTbFilterDirective,
        MatOptionTbFilterDirective,
        MatCheckboxTbFilterDirective,
        MatButtonToggleFilterDirective,
        TableFilterDirective,
        TableFilterStringContainsDirective,
        TableWrapperDirective,
        GroupByListComponent,
        DateTimeFilterComponent,
    ],
    providers : [
      SpaceCasePipe,
      DatePipe,
      CurrencyPipe,
      PhoneNumberPipe
    ]
})
export class TableBuilderModule {
  static forRoot(config: TableBuilderConfig): ModuleWithProviders<TableBuilderModule> {
    return {
      ngModule: TableBuilderModule,
      providers: [
        MultiSortDirective,
        { provide : TableBuilderConfigToken , useValue: config}
      ]
    };
  }
}
