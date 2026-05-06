import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TableStore, orderViewableMetaData } from '../../classes/table-store';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { spaceCase } from '../../../utilities/pipes/space-case.pipes';

interface VisibleRow {
  key: string;
  displayName: string;
  sortDirection: 'asc' | 'desc' | null;
  sortPriority: number | null;
}

interface HiddenRow {
  key: string;
  displayName: string;
}

@Component({
  selector: 'tb-columns-panel',
  templateUrl: './columns-panel.component.html',
  styleUrls: ['./columns-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ColumnsPanelComponent {
  visibleRows$: Observable<VisibleRow[]>;
  hiddenRows$: Observable<HiddenRow[]>;
  visibleCount$: Observable<number>;
  totalCount$: Observable<number>;

  constructor(private store: TableStore) {
    this.visibleRows$ = this.store.state$.pipe(
      map(state => {
        const sorted = state.sorted;
        return orderViewableMetaData(state)
          .filter(md => !state.hiddenKeys.includes(md.key))
          .map<VisibleRow>(md => {
            const sortIdx = sorted.findIndex(s => s.active === md.key);
            return {
              key: md.key,
              displayName: md.displayName || spaceCase(md.key),
              sortDirection: sortIdx === -1 ? null : (sorted[sortIdx].direction as 'asc' | 'desc'),
              sortPriority: sortIdx === -1 ? null : sortIdx + 1,
            };
          });
      })
    );

    this.hiddenRows$ = this.store.state$.pipe(
      map(state =>
        Object.values(state.metaData)
          .filter((md: MetaData) =>
            state.hiddenKeys.includes(md.key) &&
            md.fieldType !== FieldType.Hidden
          )
          .map<HiddenRow>(md => ({
            key: md.key,
            displayName: md.displayName || spaceCase(md.key),
          }))
      )
    );

    this.visibleCount$ = this.visibleRows$.pipe(map(rows => rows.length));
    this.totalCount$ = this.store.state$.pipe(
      map(state =>
        Object.values(state.metaData).filter((md: MetaData) => md.fieldType !== FieldType.Hidden).length
      )
    );
  }

  cycleSort(key: string, ev: Event) {
    ev.stopPropagation();
    this.store.cycleColumnSort(key);
  }

  onVisibleDrop(event: CdkDragDrop<VisibleRow[]>) {
    if (event.previousContainer === event.container) {
      // reorder within Visible — indices are in visible-rows-only space,
      // so use reorderVisibleColumn (translates to userDefined.order correctly,
      // leaving hidden columns' slots untouched).
      this.store.reorderVisibleColumn({
        previousVisibleIndex: event.previousIndex,
        currentVisibleIndex: event.currentIndex,
      });
    } else {
      // dropped from Hidden into Visible at a position
      const hiddenRow = event.item.data as HiddenRow;
      this.store.showColumnAt({ key: hiddenRow.key, newOrder: event.currentIndex });
    }
  }

  onHiddenDrop(event: CdkDragDrop<HiddenRow[]>) {
    if (event.previousContainer === event.container) {
      // reorder within Hidden — no-op for now (hidden order isn't persisted)
      return;
    }
    // dropped from Visible into Hidden
    const visibleRow = event.item.data as VisibleRow;
    this.store.hideColumn(visibleRow.key);
  }

  trackByKey(_: number, row: { key: string }) {
    return row.key;
  }
}
