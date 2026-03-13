import { Component, Input, Output, ChangeDetectionStrategy, SimpleChanges, OnInit, QueryList, ViewContainerRef, ElementRef, Injector, TemplateRef, input, output, viewChild, inject, computed, signal } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatRowDef, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatHeaderRowDef, MatHeaderRow, MatRow, MatFooterRowDef, MatFooterRow } from '@angular/material/table';
import { Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { TableStore } from '../../classes/table-store';
import { tap, map } from 'rxjs/operators';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { Dictionary } from '../../interfaces/dictionary';
import { GenericTableDataSource, GenericTableDataSourceType, GenericTableVirtualScrollDataSource } from '../../classes/GenericTableDataSource';
import { FieldType } from '../../interfaces/report-def';
import { previousAndCurrent } from '../../../rxjs/rxjs-operators';
import { ColumnInfo } from '../../interfaces/ColumnInfo';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Group } from '../../classes/TableState';
import { PaginatorComponent } from './paginator.component';
import * as _ from 'lodash';
import { StylerDirective } from '../../../utilities/directives/styler';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';

@Component({
    selector: 'tb-generic-table',
    templateUrl: './generic-table.component.html',
    styleUrls: ['./generic-table.component.scss', '../../styles/collapser.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTable, CdkDropList, StylerDirective, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatIconButton, MatIcon, NgTemplateOutlet, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow, PaginatorComponent, MatTooltip, AsyncPipe]
})
export class GenericTableComponent implements OnInit {
  protected sort = inject(MatSort);
  state = inject(TableStore);
  private viewContainer = inject(ViewContainerRef);



  drop(event: CdkDragDrop<string[]>) {
    this.state.setUserDefinedOrder({newOrder:event.currentIndex,oldOrder:event.previousIndex})
  }

  // Signal inputs with $ prefix (angular-additions convention)
  readonly $data = input.required<Observable<any[]>>({ alias: 'data$' });
  readonly $indexColumn = input(false, { alias: 'IndexColumn' });
  readonly $selectionColumn = input(false, { alias: 'SelectionColumn' });
  readonly $trackBy = input.required<string>({ alias: 'trackBy' });
  readonly $rows = input.required<readonly MatRowDef<any>[]>({ alias: 'rows' });
  readonly $isSticky = input(false, { alias: 'isSticky' });
  readonly $columnBuilders = input<ColumnBuilderComponent[]>([], { alias: 'columnBuilders' });
  readonly $columnInfos = input.required<Observable<ColumnInfo[]>>({ alias: 'columnInfos' });
  readonly $groupHeaderTemplate = input<TemplateRef<any> | null>(null, { alias: 'groupHeaderTemplate' });
  readonly $compareWithKey = input<string>('', { alias: 'compareWithKey' });

  // Computed signals
  readonly $hasIndexColumn = computed(() => this.$indexColumn());
  readonly $hasSelectionColumn = computed(() => this.$selectionColumn());

  private _disableSort!: boolean;
  @Input() set disableSort(val: boolean) {
    this._disableSort = val;
    if (val) {
      if (this.dataSource?.sort) {
        this.dataSource.sort = null;
      }
    } else {
      if (this.dataSource && !this.dataSource.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }
  get disableSort() { return this._disableSort; }

  // ViewChild signals with $ prefix
  readonly $table = viewChild.required(MatTable);
  readonly $dropList = viewChild.required(CdkDropList);
  readonly $tableElRef = viewChild.required('table', { read: ElementRef });
  readonly $paginatorComponent = viewChild.required(PaginatorComponent);

  // Output signals
  readonly paginatorChange$ = output<void>({ alias: 'paginatorChange' });
  currentColumns!: string[];
  dataSource!: any;
  keys: string [] = [];
  injector: Injector;
  rowDefArr :MatRowDef<any>[]= [];
  columns:string [] = [];
  myColumns: Dictionary<ColumnBuilderComponent> = {};
  showHeader$!: Observable<boolean>;

  private _injector = inject(Injector);

  constructor() {
    this.injector = Injector.create({ providers: [
      {provide: MatTable, useFactory: ()=> this.$table() },
      {provide: CdkDropList, useFactory: ()=> this.$dropList() },
    ], parent: this._injector});
  }

  trackByFunction = (index:number, item: any) => {
    if (!item) {
      return null;
    }
    const trackBy = this.$trackBy();
    if (trackBy) {
      return item[trackBy];
    }
    return item;
  }

  ngOnChanges(changes: SimpleChanges) {
    const rows = this.$rows();
    if (changes.rows && rows && this.myColumns.length) {
      this.initializeRowDefs([...rows]);
    }
  }

  customCompare = (o1: any, o2: any) => o1[this.$compareWithKey()] == o2[this.$compareWithKey()];
  updateSelection = (data: any[]) => {
    if (this.$hasSelectionColumn()) {
      this.selection.selected.forEach(s => !data.find(d => this.$compareWithKey() ? this.customCompare(d, s) : _.isEqual(s, d)) ? this.selection.deselect(s) : undefined);
    }
  }

  ngOnInit() {
    if (this.$hasSelectionColumn()) {
      this.columns.push('select');
      this.selection.compareWith = this.$compareWithKey() ? this.customCompare : _.isEqual;
    }

    if (this.$hasIndexColumn()) {
     this.columns.push('index');
    }

    this.createDataSource();

    this.state.on(this.$columnInfos(), columns => {
      columns.forEach(ci => this.addMetaData(ci))
    });

    this.initializeRowDefs([...this.$rows()]);

    this.state.on(this.state.displayedColumns$, keys => {
      this.keys = [...this.columns, ...keys];
      this.rowDefArr?.forEach(row => row.columns = this.keys)
    });

    this.showHeader$ = this.state.tableSettings$.pipe(map(settings => !(settings.hideColumnHeader)));
  }

  createDataSource() {
    this.dataSource = new GenericTableDataSource(
      this.$data().pipe(tap(this.updateSelection))
    );

    if (!this.disableSort) {
      this.dataSource.sort = this.sort;
    }
  }

  isGroupHeader(_: number, row: { isGroupHeader: boolean }) {
    return row.isGroupHeader;
  }

  isGroupFooter(_: number, row: { isGroupFooter: boolean }) {
    return row.isGroupFooter;
  }

  updateGroup(group: Group): void {
    this.state.updateGroups([{
      ...group,
      isExpanded: !group.isExpanded
    }]);
  }

  addMetaData(column: ColumnInfo) {
    let columnBuilder = this.myColumns[column.metaData.key];
    if(columnBuilder) {
      columnBuilder.metaData = column.metaData;
    } else {
      const component = this.viewContainer.createComponent(ColumnBuilderComponent, {
        index: 0,
        injector: this.injector
      });
      component.instance.customCell = column.customCell;
      component.instance.metaData = column.metaData;
      component.instance.data$ = this.$data();
      this.myColumns[column.metaData.key] = component.instance;
    }
  }

  initializeRowDefs = (defs:MatRowDef<any>[])=>{
    this.rowDefArr.forEach(r=>this.$table().removeRowDef(r));
    this.rowDefArr = defs;
    defs.forEach(r => {
      r.columns = this.columns.concat(Object.values(this.myColumns).filter(c => c.metaData.fieldType !== FieldType.Hidden).map(c => c.metaData.key));
      const table = this.$table();
      if (table) {
        table.addRowDef(r);
      }
    });
  }

  selection : SelectionModel<any> = new SelectionModel<any>(true, []);
  @Output() selection$: Observable<any> = this.selection.changed;
  masterToggleChecked$ = this.selection$.pipe(map(()=>this.selection.hasValue() && this.isAllSelected()));
  masterToggleIndeterminate$ = this.selection$.pipe(map(()=>this.selection.hasValue() && !this.isAllSelected()));

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.selection.select(...this.dataSource.data);
  }

  tableWidth = this.state.getUserDefinedTableSize$.pipe(
    previousAndCurrent<number | undefined>(0),
    map(([previousUserDefinedWidth, currentUserDefinedWidth]) => {
      if( currentUserDefinedWidth){
        return ({width:`${currentUserDefinedWidth}px`});
      } if( wasReset() ){
        return ({width:'initial'});
      }
      return ({});

      function wasReset(){
        return (previousUserDefinedWidth ?? 0) >=0 && currentUserDefinedWidth == null;
      }
    })
  );

  collapseFooter$ = this.state.state$.pipe(map(state => state.persistedTableSettings.collapseFooter));
}

@Component({
    selector: 'tb-generic-table-vs',
    templateUrl: './generic-table-vs.component.html',
    styleUrls: ['./generic-table.component.scss', '../../styles/collapser.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CdkVirtualScrollViewport, TableVirtualScrollModule, MatTable, CdkDropList, StylerDirective, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatFooterCellDef, MatFooterCell, MatIconButton, MatIcon, NgTemplateOutlet, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatFooterRowDef, MatFooterRow, PaginatorComponent, MatTooltip, AsyncPipe]
})
export class GenericTableVsComponent extends GenericTableComponent {
  override createDataSource() {
    this.dataSource = new GenericTableVirtualScrollDataSource(
      this.$data().pipe(tap(this.updateSelection))
    );

    if (!this.disableSort) {
      this.dataSource.sort = this.sort;
    }
  }

  override ngOnInit() {
    this.columns.push('groupHeader');

    // Material v20+ does not support conditional row defs (when) with virtual scrolling.
    // Wrap initializeRowDefs to filter out rows with `when` predicates before they reach the table.
    const originalInit = this.initializeRowDefs;
    this.initializeRowDefs = (defs: MatRowDef<any>[]) => {
      originalInit(defs.filter(r => !r.when));
    };

    super.ngOnInit();
  }
}
