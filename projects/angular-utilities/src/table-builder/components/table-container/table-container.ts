import {
  Component,
  Input,
  EventEmitter,
  Output,
  ContentChildren,
  QueryList,
  ChangeDetectionStrategy,
  Inject,
  Predicate,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable, from, ReplaySubject, Subscription } from 'rxjs';
import { ArrayAdditional, FieldType, MetaData } from '../../interfaces/report-def';
import { first, last, map, switchMap, tap, withLatestFrom, mergeAll, scan } from 'rxjs/operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatRowDef } from '@angular/material/table';
import { CustomCellDirective, TableCustomFilterDirective, TableFilterDirective } from '../../directives';
import {  stateIs, TableStore } from '../../classes/table-store';
import { DataFilter } from '../../classes/data-filter';
import { combineArrays, mapArray, notNull } from '../../../rxjs/rxjs-operators';
import { ExportToCsvService } from '../../services/export-to-csv.service';
import { ArrayDefaults } from '../../classes/DefaultSettings';
import { TableBuilderConfig, TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import * as selectors from '../../ngrx/selectors';
import { select, Store } from '@ngrx/store';
import { deleteLocalProfilesState, setLocalProfile, setLocalProfilesState } from '../../ngrx/actions';
import { Group, InitializationState, PersistedTableState } from '../../classes/TableState';
import { sortData } from '../../functions/sort-data-function';
import { WrapperFilterStore } from '../table-container-filter/table-wrapper-filter-store';
import { cloneDeep, groupBy } from 'lodash';
import { ColumnInfo } from '../../interfaces/ColumnInfo';
import { defaultShareReplay } from '../../../rxjs';
import { flattenDeep } from 'lodash';
import { createFilterFunc, isCustomFilter, isFilterInfo } from '../../classes/filter-info';
import { Dictionary } from '../../interfaces/dictionary';
import { TableWrapperDirective } from '../../directives/table-wrapper.directive';
import { createLinkCreator } from '../../services/link-creator.service';

const BLANK_GROUP_LABEL = '(Blank)';
import { GenericTableComponent } from '../generic-table/generic-table.component';

@Component({
    selector: 'tb-table-container',
    templateUrl: './table-container.html',
    styleUrls: ['./table-container.css', '../../styles/collapser.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TableStore, ExportToCsvService, WrapperFilterStore],
    standalone: false
}) export class TableContainerComponent<T = any> {

  @ViewChild(GenericTableComponent) private genericTableComponent!: GenericTableComponent;

  @ContentChildren(TableCustomFilterDirective, {descendants: true}) customFilters!: QueryList<TableCustomFilterDirective>;
  @ContentChildren(TableFilterDirective, {descendants: true}) filters!: QueryList<TableFilterDirective>;

  @Input() tableId!: string;
  @Input() tableBuilder!: TableBuilder;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy!: string;
  @Input() isSticky = true;
  @Input() set isVs(val: boolean | string) {
    if (val || val === '') {
      this._isVs = true;
    } else {
      this._isVs = false;
    }
  }

  @Input() set pageSize(value: number) {
    this.state.setPageSize(value);
  }
  @Input() inputFilters?: Observable<Array<Predicate<T>>>;
  @Input() groupHeaderTemplate!: TemplateRef<any>;
  @Input() compareWithKey!: string;
  @Output() selection$ = new EventEmitter();
  dataSubject = new ReplaySubject<Observable<T[]>>(1);
  @Output() data = this.dataSubject.pipe(
    switchMap( d => d),
    defaultShareReplay(),
  );
  @Output() paginatorChange = new EventEmitter<void>();

  _isVs!: boolean;

  @ContentChildren(MatRowDef) customRows!: QueryList<MatRowDef<any>>;

  @ContentChildren(CustomCellDirective) customCells!: QueryList<CustomCellDirective>;
  @Output() OnStateReset = new EventEmitter();
  @Output() OnSaveState = new EventEmitter();
  @Output() state$ : Observable<PersistedTableState>;

  myColumns$!: Observable<ColumnInfo[]>;

  stateKeys$?: Observable<string[] | null>;
  currentStateKey$?: Observable<string>;

  disableSort!: boolean;

  constructor(
    public state: TableStore,
    public exportToCsvService: ExportToCsvService<T>,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
    private store: Store<any>,
    @Optional() private wrapper: TableWrapperDirective,
  ) {
     this.state.on( this.state.getSavableState().pipe(last()), finalState => {
      if(this.tableId) {
        this.store.dispatch(setLocalProfile({key:this.tableId,value: finalState}));
      }
    });
    this.state$ = this.state.getSavableState().pipe(
      map(state => cloneDeep(state)),
      defaultShareReplay(),
    );
  }

  firstPage(): void {
    this.genericTableComponent?.paginatorComponent?.paginator?.firstPage();
  }

  lastPage(): void {
    this.genericTableComponent?.paginatorComponent?.paginator?.lastPage();
  }

  resetState() {
    this.customFilters.forEach( cf => cf.reset());
    this.filters.forEach( cf => cf.reset() );
    this.state.resetState();
    this.OnStateReset.next(null)
  }

  initializeState() {
    this.state.setTableSettings(this.tableBuilder.settings);
    this.state.runOnceWhen(stateIs(InitializationState.MetaDataLoaded), state => {
      if(this.tableId) {
        const persistedState$ = this.store.pipe(
          select(selectors.selectLocalProfileState<any>(this.tableId) ),
          tap( persistedState => {
            if(!persistedState) {
              this.state.setIntializationState(InitializationState.LoadedFromStore);
            }
          }),
          notNull(),
        );
        this.state.updateStateFromPersistedState(persistedState$);

      } else {
        this.state.setIntializationState(InitializationState.LoadedFromStore);
      }
    });
  }
  customFilters$ = new BehaviorSubject<Predicate<any>[]>([]);
  initializeData() {


    var allFilters = this.inputFilters ? combineArrays([
      this.customFilters$,
      this.inputFilters
    ]) : this.customFilters$;

    const filters$ = this.state.filters$.pipe(map( filters => Object.values(filters) ))

    const data = new DataFilter(allFilters)
      .appendFilters(filters$)
      .filterData(this.tableBuilder.getData$()).pipe(
        switchMap(data => this.state.groupByKeys$.pipe(
          map(groupBy => this.getData(data, groupBy)),
        ).pipe(
          switchMap(data => this.state.groups$.pipe(
            map(groups => this.setDisplay(data, groups))
          ))
        ))
      );

    this.dataSubject.next(data);
  }

  ngOnInit() {
    this.initializeState();
    this.initializeData();

    if(this.tableId) {
      this.stateKeys$ = this.store.select(selectors.selectLocalProfileKeys(this.tableId));
      this.currentStateKey$ = this.store.select(selectors.selectLocalProfileCurrentKey(this.tableId));
    }
  }

  exportToCsv(): void {
    const sorted = this.data.pipe(
      withLatestFrom(this.state.sorted$),
      map(([data, sorted]) => sortData(data, sorted))
    );
    this.exportToCsvService.exportToCsv(sorted);
  }

  saveState() {
    this.state.getSavableState().pipe(
      first()
    ).subscribe( tableState => {
      this.OnSaveState.next(null);
      this.store.dispatch(setLocalProfile({ key: this.tableId, value:tableState, persist: true} ));
    });
  }

  setProfileState(val: string) {
    this.store.dispatch(setLocalProfilesState({key:this.tableId, current: val}));
  }

  deleteProfileState(stateKey: string) {
    this.store.dispatch(deleteLocalProfilesState({key:this.tableId, stateKey}));
  }


  ngAfterContentInit() {
    this.InitializeColumns();

    this.state.runOnceWhen(stateIs(InitializationState.LoadedFromStore), state => {

      var allFilters = [...this.filters, ...this.customFilters];
      if(this.wrapper) {
        allFilters = [...allFilters, ...this.wrapper.customFilters, ...this.wrapper.filters, ...this.wrapper.registerations];
      }

      var customFilters: (TableCustomFilterDirective|TableFilterDirective )[] = [];

      allFilters.filter( f => !f.used).forEach( f => {
        f.used = true;
        if(f.savable) {
          var filter = state.filters[f.filterId];
          if(isFilterInfo(filter)) {
            const filterDirective: TableFilterDirective = f as TableFilterDirective;
            filterDirective.fieldType = filter.fieldType;
            filterDirective.filterType = filter.filterType;
            filterDirective.setFilterValue(filter.filterValue);
            filterDirective.key = filter.key;
            filterDirective.update();
          }
          if(isCustomFilter(filter)) {
            f.active = filter.active ?? false;
          }
          this.state.addFilter(f.filter$);
        } else {
          customFilters.push(f);
        }
      });

      const filters$ =  from( customFilters.map( cf => cf.filter$  )).pipe(
        mergeAll(),
        scan( (a,b)=> {
            if(b.active) {
              a[b.filterId] = isCustomFilter(b) ? b.predicate : createFilterFunc(b);
            } else {
              delete a[b.filterId] ;
            }
         return a;
        }, {} as Dictionary<Predicate<any>>),
        map( f => Object.values(f))
      );
      this.state.on(filters$, (f) => {
        this.customFilters$.next(f);
      });
      this.state.updateState({initializationState: InitializationState.Ready});
    });

  }

  InitializeColumns() {
    const customCellMap = new Map(this.customCells.map(cc => [cc.customCell,cc]));
    this.state.setMetaData(this.tableBuilder.metaData$!.pipe(
      map((mds) => {
        mds = mds.map(this.mapMetaDatas);
        return [
          ...mds,
          ...this.customCells.map( cc => cc.getMetaData(mds.find( item => item.key === cc.customCell )) )
        ]
      })
    ));
    this.state.setLinkMaps(this.tableBuilder.metaData$!.pipe(
      map((mds) => {
        return mds.reduce((acc, md) => {
          if(md.fieldType === FieldType.Link){ acc[md.key]= createLinkCreator(md)}
          return acc;
        },{})
      })
    ))

    this.myColumns$ = this.state.metaDataArray$.pipe(
      mapArray( metaData => ({metaData, customCell: customCellMap.get(metaData.key)!}))
    );
  }
  mapMetaDatas = (meta : MetaData<T>) => {
    if(meta.fieldType === FieldType.Array){
      const additional = {...meta.additional} as ArrayAdditional;
      additional.arrayStyle = additional?.arrayStyle ?? ArrayDefaults.arrayStyle;
      additional.limit = additional.limit ?? this.config.arrayInfo?.limit ?? ArrayDefaults.limit;
      return {...meta,additional}
    }
    return meta;
  }

  collapseHeader$ = this.state.state$.pipe(map(state => state.persistedTableSettings.collapseHeader));

  getData(data: any[], groupByKeys: string[]): any[] {
    if (!groupByKeys.length) {
      this.disableSort = false;
      return data;
    }
    this.disableSort = true;
    return this.tbGroupBy(data, groupByKeys);
  }

  tbGroupBy = (data: any[], groupByKeys: string[], parentGroupName?: any): any[] => {
    let res = {};
    const key = groupByKeys[0];
    res = groupBy(data, (row: any) => {
      const v = row?.[key];
      const isBlank =
        v === null
        || v === undefined
        || v === ''
        || (Array.isArray(v) && v.length === 0);
      return isBlank ? BLANK_GROUP_LABEL : v;
    });
    const remainingGroupByKeys = groupByKeys.slice(1);
    if (remainingGroupByKeys.length) {
      Object.keys(res).forEach(key => res[key] = this.tbGroupBy(res[key], remainingGroupByKeys, key))
    }
    return flattenDeep(Object.keys(res).map(groupName => {
      const uniqName = parentGroupName ? `${parentGroupName}-${groupName}` : `${groupName}`;
      return [
        {
          isGroupHeader: true,
          groupHeaderName: `${groupName} (${res[groupName]?.filter(row => !row.isGroupHeader)?.length})`,
          data: res[groupName],
          groupName: uniqName,
          padding: 0
        },
        (res[groupName] as any[])?.map(d => ({ ...d, parentGroupName: d.parentGroupName || uniqName }))
      ];
    })).map(this.addIndentation);
  }

  addIndentation = (d: any) => {
    if (d.isGroupHeader) {
      if (d.padding) {
        d.padding += 20;
      } else {
        d.padding = 1;
      }
    }
    return d;
  }

  setDisplay = (data: any[], groups: Group[]): any[] => data
    .map(d => ({
      ...d,
      shouldDisplay: !d.parentGroupName || this.shouldDisplay(groups.find(g => g.groupName == d.parentGroupName), groups),
      isExpanded: groups.find(g => g.groupName == d.groupName)?.isExpanded
    }))
    .filter(d => d.shouldDisplay);


  shouldDisplay = (currentGroup?: Group, groups?: Group[]): boolean => {
    if (!currentGroup?.isExpanded) {
      return false;
    }

    const parentGroup = groups?.find(g => g.groupName == currentGroup.parentGroupName);

    if (parentGroup) {
      return this.shouldDisplay(parentGroup, groups);
    }

    return true;
  }
}
