import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MetaData, FieldType } from '../../../interfaces/report-def';
import { Observable } from 'rxjs';
import { TableStore } from '../../../classes/table-store';
import { map } from 'rxjs/operators';
import { WrapperFilterStore } from '../table-wrapper-filter-store';
import { MatIconButton } from '@angular/material/button';
import { StopPropagationDirective } from '../../../../utilities/directives/stop-propagation.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { SpaceCasePipe } from '../../../../utilities/pipes/space-case.pipes';

@Component({
    selector: 'tb-filter-displayer',
    templateUrl: './gen-filter-displayer.component.html',
    styleUrls: ['./gen-filter-displayer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconButton, StopPropagationDirective, MatTooltip, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, AsyncPipe, SpaceCasePipe]
})
export class GenFilterDisplayerComponent {

  constructor( public tableState: TableStore, public filterStore : WrapperFilterStore) {
    this.filterCols$ =  tableState.metaDataArray$.pipe(
      map(md => Object.values( md ).filter(m => (m.fieldType !== FieldType.Hidden) && (!m.noFilter))),
    );
  }

    filterCols$: Observable<MetaData[]>;

    addFilter(metaData: MetaData) {
      this.filterStore.addFilter({key: metaData.key, fieldType: metaData.fieldType});
    }
}
