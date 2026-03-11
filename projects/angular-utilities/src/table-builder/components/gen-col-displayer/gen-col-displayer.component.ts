import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DisplayCol } from '../../classes/display-col';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { orderViewableMetaData, TableStore } from '../../classes/table-store';
import { CdkDragDrop, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { StopPropagationDirective } from '../../../utilities/directives/stop-propagation.directive';
import { AsyncPipe } from '@angular/common';
import { SpaceCasePipe } from '../../../utilities/pipes/space-case.pipes';

@Component({
    selector: 'tb-col-displayer',
    templateUrl: './gen-col-displayer.component.html',
    styleUrls: ['./gen-col-displayer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTooltip, MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, StopPropagationDirective, CdkDropList, CdkDrag, AsyncPipe, SpaceCasePipe]
})
export class GenColDisplayerComponent {
  private tableState = inject(TableStore);

  columns$: Observable< DisplayCol[]>;
  constructor() {
    this.columns$ = this.tableState.state$.pipe(
      map( state =>
        orderViewableMetaData(state)
          .map( md => ({
            key: md.key,
            displayName: md.displayName,
            isVisible: !state.hiddenKeys.includes(md.key)
          }))
      ),
    );
  }

  reset(displayCols: DisplayCol[]) {
    displayCols.forEach(c => c.isVisible = true);
    this.emit(displayCols);
  }
  drop(event: CdkDragDrop<string[]>) {
    this.tableState.setUserDefinedOrder({newOrder:event.currentIndex,oldOrder:event.previousIndex})
  }
  unset(displayCols: DisplayCol[]) {
    displayCols.forEach(c => c.isVisible = false);
    this.emit(displayCols);
  }

  emit(displayCols: DisplayCol[]) {
    this.tableState.setHiddenColumns(displayCols.map( c => ({key: c.key, visible: c.isVisible})));
  }
}
