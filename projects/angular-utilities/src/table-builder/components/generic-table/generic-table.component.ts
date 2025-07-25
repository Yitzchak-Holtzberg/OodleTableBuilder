import {
  Component,
  ViewChild,
  Input,
  ChangeDetectionStrategy,
  Output,
  SimpleChanges,
  OnInit,
  QueryList,
  ViewContainerRef,
  ElementRef,
  Injector,
  TemplateRef,
  EventEmitter,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatRowDef, MatTable } from '@angular/material/table';
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

@Component({
    selector: 'tb-generic-table',
    templateUrl: './generic-table.component.html',
    styleUrls: ['./generic-table.component.scss', '../../styles/collapser.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GenericTableComponent implements OnInit {


  drop(event: CdkDragDrop<string[]>) {
    this.state.setUserDefinedOrder({newOrder:event.currentIndex,oldOrder:event.previousIndex})
  }

  @Input() data$!: Observable<any[]>;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy!: string;
  @Input() rows!: QueryList<MatRowDef<any>>;
  @Input() isSticky = false;
  @Input() columnBuilders!: ColumnBuilderComponent[];
  @Input() columnInfos!: Observable<ColumnInfo[]>;
  @Input() groupHeaderTemplate!: TemplateRef<any>;
  @Input() compareWithKey!: string;

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

  @ViewChild(MatTable, { static: true }) table!: MatTable<any>;
  @ViewChild(CdkDropList, { static: true }) dropList!: CdkDropList;
  @ViewChild('table', {read: ElementRef}) tableElRef!: ElementRef;
  @ViewChild(PaginatorComponent) paginatorComponent!: PaginatorComponent;
  @Output() paginatorChange = new EventEmitter<void>();
  currentColumns!: string[];
  dataSource!: any;
  keys: string [] = [];
  injector: Injector;
  rowDefArr :MatRowDef<any>[]= [];
  columns:string [] = [];
  myColumns: Dictionary<ColumnBuilderComponent> = {};
  showHeader$!: Observable<boolean>;

  constructor(
    protected sort: MatSort,
    public state: TableStore,
    private viewContainer: ViewContainerRef,
    injector: Injector,
    ) {

    this.injector = Injector.create({ providers: [
      {provide: MatTable, useFactory: ()=> {return this.table} },
      {provide: CdkDropList, useFactory: ()=> {return this.dropList} },
    ], parent: injector});
  }

  trackByFunction = (index:number, item: any) => {
    if (!item) {
      return null;
    }
    if (this.trackBy) {
      return item[this.trackBy];
    }
    return item;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.rows && this.rows && this.myColumns.length) {
      this.initializeRowDefs([...this.rows]);
    }
  }

  customCompare = (o1: any, o2: any) => o1[this.compareWithKey] == o2[this.compareWithKey];
  updateSelection = (data: any[]) => {
    if (this.SelectionColumn) {
      this.selection.selected.forEach(s => !data.find(d => this.compareWithKey ? this.customCompare(d, s) : _.isEqual(s, d)) ? this.selection.deselect(s) : undefined);
    }
  }

  ngOnInit() {
    if (this.SelectionColumn) {
      this.columns.push('select');
      this.selection.compareWith = this.compareWithKey ? this.customCompare : _.isEqual;
    }

    if (this.IndexColumn) {
     this.columns.push('index');
    }

    this.createDataSource();

    this.state.on(this.columnInfos, columns => {
      columns.forEach(ci => this.addMetaData(ci))
    });

    this.initializeRowDefs([...this.rows]);

    this.state.on(this.state.displayedColumns$, keys => {
      this.keys = [...this.columns, ...keys];
      this.rowDefArr?.forEach(row => row.columns = this.keys)
    });

    this.showHeader$ = this.state.tableSettings$.pipe(map(settings => !(settings.hideColumnHeader)));
  }

  createDataSource() {
    this.dataSource = new GenericTableDataSource(
      this.data$.pipe(tap(this.updateSelection))
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
      component.instance.data$ = this.data$;
      this.myColumns[column.metaData.key] = component.instance;
    }
  }

  initializeRowDefs = (defs:MatRowDef<any>[])=>{
    this.rowDefArr.forEach(r=>this.table.removeRowDef(r));
    this.rowDefArr = defs;
    defs.forEach(r => {
      r.columns = this.columns.concat(Object.values(this.myColumns).filter(c => c.metaData.fieldType !== FieldType.Hidden).map(c => c.metaData.key));
      if (this.table) {
        this.table.addRowDef(r);
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
    standalone: false
})
export class GenericTableVsComponent extends GenericTableComponent {
  createDataSource() {
    this.dataSource = new GenericTableVirtualScrollDataSource(
      this.data$.pipe(tap(this.updateSelection))
    );

    if (!this.disableSort) {
      this.dataSource.sort = this.sort;
    }
  }
}
