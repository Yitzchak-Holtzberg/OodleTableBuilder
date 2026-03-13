import { Component, Input, Output, ChangeDetectionStrategy, Predicate, TemplateRef, input, output, viewChild, contentChildren, inject, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable, from, of, ReplaySubject, Subscription } from 'rxjs';
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
import { createFilterFunc, isCustomFilter, isFilterInfo } from '../../classes/filter-info';
import { Dictionary } from '../../interfaces/dictionary';
import { TableWrapperDirective } from '../../directives/table-wrapper.directive';
import { createLinkCreator } from '../../services/link-creator.service';
import { GenericTableComponent, GenericTableVsComponent } from '../generic-table/generic-table.component';
import { MultiSortDirective } from '../../directives/multi-sort.directive';
import { LetDirective } from '@ngrx/component';
import { GroupByListComponent } from '../group-by-list/group-by-list.component';
import { FilterChipsComponent } from '../table-container-filter/filter-list/filter-list.component';
import { NgTemplateOutlet, NgClass, AsyncPipe } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { GenFilterDisplayerComponent } from '../table-container-filter/gen-filter-displayer/gen-filter-displayer.component';
import { GenColDisplayerComponent } from '../gen-col-displayer/gen-col-displayer.component';
import { SortMenuComponent } from '../sort-menu/sort-menu.component';
import { ClickEmitterDirective } from '../../../utilities/directives/clickEmitterDirective';
import { StopPropagationDirective } from '../../../utilities/directives/stop-propagation.directive';
import { DialogDirective } from '../../../utilities/directives/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'tb-table-container',
    templateUrl: './table-container.html',
    styleUrls: ['./table-container.css', '../../styles/collapser.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TableStore, ExportToCsvService, WrapperFilterStore],
    imports: [MultiSortDirective, LetDirective, GroupByListComponent, FilterChipsComponent, NgTemplateOutlet, MatIconButton, MatMenuTrigger, NgClass, MatIcon, MatMenu, MatTooltip, GenericTableComponent, GenericTableVsComponent, GenFilterDisplayerComponent, GenColDisplayerComponent, SortMenuComponent, MatMenuItem, ClickEmitterDirective, StopPropagationDirective, DialogDirective, MatFormField, MatInput, MatButton, AsyncPipe]
}) export class TableContainerComponent<T = any> {
  state = inject(TableStore);
  exportToCsvService = inject<ExportToCsvService<T>>(ExportToCsvService);
  private config = inject<TableBuilderConfig>(TableBuilderConfigToken);
  private store = inject<Store<any>>(Store);
  private wrapper = inject(TableWrapperDirective, { optional: true });


  // ViewChild signals with $ prefix
  readonly $genericTableComponent = viewChild.required(GenericTableComponent);

  // ContentChildren signals with $ prefix
  readonly $customFilters = contentChildren(TableCustomFilterDirective, { descendants: true });
  readonly $filters = contentChildren(TableFilterDirective, { descendants: true });
  readonly $customRows = contentChildren(MatRowDef);
  readonly $customCells = contentChildren(CustomCellDirective);

  // Input signals with $ prefix and aliases for backward compatibility
  readonly tableId = input.required<string>();
  readonly tableBuilder = input.required<TableBuilder>();
  readonly $indexColumn = input(false, { alias: 'IndexColumn' });
  readonly $selectionColumn = input(false, { alias: 'SelectionColumn' });
  readonly $trackBy = input('', { alias: 'trackBy' });
  readonly $isSticky = input(true, { alias: 'isSticky' });
  readonly $inputFilters = input<Observable<Array<Predicate<T>>> | undefined>(undefined, { alias: 'inputFilters' });
  readonly $groupHeaderTemplate = input<TemplateRef<any> | null>(null, { alias: 'groupHeaderTemplate' });
  readonly $compareWithKey = input<string>('', { alias: 'compareWithKey' });

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

  // Output signals with $ suffix and aliases
  readonly selection$ = output<any>({ alias: 'selection$' });
  readonly paginatorChange$ = output<void>({ alias: 'paginatorChange' });
  readonly onStateReset$ = output<void>({ alias: 'OnStateReset' });
  readonly onSaveState$ = output<void>({ alias: 'OnSaveState' });

  dataSubject = new ReplaySubject<Observable<T[]>>(1);
  @Output() data = this.dataSubject.pipe(
    switchMap( d => d),
    defaultShareReplay(),
  );

  _isVs!: boolean;

  @Output() state$ : Observable<PersistedTableState>;

  myColumns$!: Observable<ColumnInfo[]>;

  stateKeys$?: Observable<string[] | null>;
  currentStateKey$?: Observable<string>;

  disableSort!: boolean;

  constructor() {
     this.state.on( this.state.getSavableState().pipe(last()), finalState => {
      const tableId = this.tableId();
      if(tableId) {
        this.store.dispatch(setLocalProfile({key:tableId,value: finalState}));
      }
    });
    this.state$ = this.state.getSavableState().pipe(
      map(state => cloneDeep(state)),
      defaultShareReplay(),
    );
  }

  firstPage(): void {
    this.$genericTableComponent()?.$paginatorComponent()?.paginator()?.firstPage();
  }

  lastPage(): void {
    this.$genericTableComponent()?.$paginatorComponent()?.paginator()?.lastPage();
  }

  resetState() {
    this.$customFilters().forEach( cf => cf.reset());
    this.$filters().forEach( cf => cf.reset() );
    this.state.resetState();
    this.onStateReset$.emit()
  }

  initializeState() {
    this.state.setTableSettings(this.tableBuilder().settings);
    this.state.runOnceWhen(stateIs(InitializationState.MetaDataLoaded), state => {
      const tableId = this.tableId();
      if(tableId) {
        const persistedState$ = this.store.pipe(
          select(selectors.selectLocalProfileState<any>(tableId) ),
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
  customFiltersSubject$ = new BehaviorSubject<Predicate<any>[]>([]);
  initializeData() {


    const inputFilters = this.$inputFilters();
    const allFilters = inputFilters ? combineArrays([
      this.customFiltersSubject$,
      inputFilters
    ]) : this.customFiltersSubject$;

    const filters$ = this.state.filters$.pipe(map( filters => Object.values(filters) ))

    const data = new DataFilter(allFilters)
      .appendFilters(filters$)
      .filterData(this.tableBuilder().getData$()).pipe(
        switchMap(data => this.state.groupByKeys$.pipe(
          switchMap(groupBy => {
            const grouped = this.getData(data, groupBy);
            if (!groupBy.length) {
              return of(grouped);
            }
            return this.state.groups$.pipe(
              map(groups => this.setDisplay(grouped, groups))
            );
          })
        ))
      );

    this.dataSubject.next(data);
  }

  ngOnInit() {
    this.initializeState();
    this.initializeData();

    const tableId = this.tableId();
    if(tableId) {
      this.stateKeys$ = this.store.select(selectors.selectLocalProfileKeys(tableId));
      this.currentStateKey$ = this.store.select(selectors.selectLocalProfileCurrentKey(tableId));
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
      this.onSaveState$.emit();
      this.store.dispatch(setLocalProfile({ key: this.tableId(), value:tableState, persist: true} ));
    });
  }

  setProfileState(val: string) {
    this.store.dispatch(setLocalProfilesState({key:this.tableId(), current: val}));
  }

  deleteProfileState(stateKey: string) {
    this.store.dispatch(deleteLocalProfilesState({key:this.tableId(), stateKey}));
  }


  ngAfterContentInit() {
    this.InitializeColumns();

    this.state.runOnceWhen(stateIs(InitializationState.LoadedFromStore), state => {

      let allFilters = [...this.$filters(), ...this.$customFilters()];
      if(this.wrapper) {
        allFilters = [...allFilters, ...this.wrapper.customFilters(), ...this.wrapper.filters(), ...this.wrapper.registerations];
      }

      const customFilters: (TableCustomFilterDirective|TableFilterDirective )[] = [];

      allFilters.filter( f => !f.used).forEach( f => {
        f.used = true;
        if(f.savable) {
          const filter = state.filters[f.filterId];
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
        this.customFiltersSubject$.next(f);
      });
      this.state.updateState({initializationState: InitializationState.Ready});
    });

  }

  InitializeColumns() {
    const customCellMap = new Map(this.$customCells().map(cc => [cc.customCell(),cc]));
    const tableBuilder = this.tableBuilder();
    this.state.setMetaData(tableBuilder.metaData$!.pipe(
      map((mds) => {
        mds = mds.map(this.mapMetaDatas);
        const mdsByKey = new Map(mds.map(md => [md.key, md]));
        return [
          ...mds,
          ...this.$customCells().map( cc => cc.getMetaData(mdsByKey.get(cc.customCell())) )
        ]
      })
    ));
    this.state.setLinkMaps(tableBuilder.metaData$!.pipe(
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
    const result: any[] = [];
    const grouped = groupBy(data, groupByKeys[0]);
    const remainingGroupByKeys = groupByKeys.slice(1);

    for (const groupName of Object.keys(grouped)) {
      const uniqName = parentGroupName ? `${parentGroupName}-${groupName}` : groupName;
      let children: any[];

      if (remainingGroupByKeys.length) {
        children = this.tbGroupBy(grouped[groupName], remainingGroupByKeys, groupName);
      } else {
        children = grouped[groupName];
      }

      const dataCount = children.filter(row => !row.isGroupHeader).length;
      result.push({
        isGroupHeader: true,
        groupHeaderName: `${groupName} (${dataCount})`,
        data: children,
        groupName: uniqName,
        padding: parentGroupName ? 21 : 1
      });

      for (const d of children) {
        if (!d.parentGroupName) {
          d.parentGroupName = uniqName;
        }
        result.push(d);
      }
    }

    return result;
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
