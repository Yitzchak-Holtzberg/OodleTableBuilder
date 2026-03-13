import { CustomFilter, FilterInfo } from './filter-info';
import { Dictionary } from '../interfaces/dictionary';
import { Sort } from '@angular/material/sort';
import { MetaData, Target } from '../interfaces/report-def';
import { NotPersistedTableSettings, PersistedTableSettings } from './table-builder-general-settings';

export interface Group {
  groupName?: string;
  parentGroupName?: string;
  isExpanded?: boolean;
}

export interface PersistedTableState {
  hiddenKeys?: string [];
  pageSize?: number;
  filters: Dictionary<FilterInfo | CustomFilter>;
  sorted : Sort [];
  userDefined : {order:Dictionary<number>,widths:Dictionary<number>,table:{width?:number}};
  persistedTableSettings : PersistedTableSettings;
  groupByKeys: string[];
  groups: Group[];
}

export interface TableState extends Required<PersistedTableState> {
  initializationState: InitializationState;
  metaData: Dictionary<MetaData>;
  notPersistedTableSettings : NotPersistedTableSettings;
  linkMaps:{[key:string]:{
    link: (t:any)=>string,
    useRouterLink: boolean,
    target: Target
  }};
}
type RequireNull<T> = { [K in keyof T]: null };
class KeysToDelete implements  RequireNull<Omit<TableState, keyof PersistedTableState>> {
  initializationState = null;
  metaData = null;
  notPersistedTableSettings = null;
  linkMaps = null;
}
export const keysToDelete = Object.keys(new KeysToDelete());

export enum InitializationState {
  Created,
  MetaDataLoaded,
  LoadedFromStore,
  Ready,
}

export const defaultTableState: TableState = {
  initializationState: InitializationState.Created,
  metaData: {},
  filters: {},
  hiddenKeys: [],
  sorted: [],
  userDefined:{order:{},widths:{},table:{}},
  persistedTableSettings : new PersistedTableSettings(),
  notPersistedTableSettings : new NotPersistedTableSettings(),
  pageSize: 10,
  linkMaps:{},
  groupByKeys: [],
  groups: []
};
