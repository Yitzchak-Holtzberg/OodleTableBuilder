import { Component, inject } from '@angular/core';
import { TableStore } from '../../../classes/table-store';
import { CustomFilter, FilterInfo, isFilterInfo } from '../../../classes/filter-info';
import { map } from 'rxjs/operators';
import { WrapperFilterStore } from '../table-wrapper-filter-store';
import { Observable } from 'rxjs';
import { LetDirective } from '@ngrx/component';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { FilterComponent } from '../../filter/filter.component';
import { MatChipSet, MatChip, MatChipRemove } from '@angular/material/chips';
import { AsyncPipe } from '@angular/common';
import { KeyDisplayPipe } from '../../../pipes/key-display';
import { FormatFilterValuePipe } from '../../../pipes/format-filter-value.pipe';
import { FormatFilterTypePipe } from '../../../pipes/format-filter-type.pipe';

@Component({
    selector: 'lib-filter-list',
    templateUrl: './filter-list.component.html',
    styleUrls: ['../gen-filter-displayer/gen-filter-displayer.component.css'],
    imports: [LetDirective, MatIconButton, MatTooltip, MatIcon, FilterComponent, MatChipSet, MatChip, MatChipRemove, AsyncPipe, KeyDisplayPipe, FormatFilterValuePipe, FormatFilterTypePipe]
})
export class FilterChipsComponent {
  tableState = inject(TableStore);
  private filterStore = inject(WrapperFilterStore);


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
