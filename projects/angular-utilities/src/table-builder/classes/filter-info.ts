import { StringFilterMap, DateFilterMap, NumberFilterMap, BooleanFilterMap, FilterType, FilterToFiltersMap, EnumFilterMap, DateTimeFilterMap } from '../enums/filterTypes';
import { EnumFilterFuncs, StringFilterFuncs } from '../functions/string-filter-function';
import { NumberFilterFuncs } from '../functions/number-filter-function';
import { DateFilterFuncs, DateTimeFilterFuncs } from '../functions/date-filter-function';
import { BooleanFilterFuncs } from '../functions/boolean-filter-function';
import { FieldType } from '../interfaces/report-def';
import { Dictionary } from '../interfaces/dictionary';
import { Predicate } from '@angular/core';
import { get } from 'lodash';

type FilterTypeMapType = { [key in FieldType]: FilterToFiltersMap};
export type UnmappedTypes = FieldType.Expression |
  FieldType.Hidden |
  FieldType.ImageUrl;


export type mappedFieldTypes =
  FieldType.Unknown |
  FieldType.Date |
  FieldType.DateTime |
  FieldType.Currency |
  FieldType.Array |
  FieldType.Number |
  FieldType.String |
  FieldType.Boolean |
  FieldType.PhoneNumber |
  FieldType.Link |
  FieldType.Enum;

export const filterTypeMap: Omit<FilterTypeMapType, UnmappedTypes> = {
  [FieldType.Unknown] : StringFilterMap,
  [FieldType.Date] : DateFilterMap,
  [FieldType.DateTime]: DateTimeFilterMap,
  [FieldType.Currency] : NumberFilterMap,
  [FieldType.Array] : StringFilterMap,
  [FieldType.Number] : NumberFilterMap,
  [FieldType.String] : StringFilterMap,
  [FieldType.Boolean] : BooleanFilterMap,
  [FieldType.PhoneNumber] : StringFilterMap,
  [FieldType.Link] : StringFilterMap,
  [FieldType.Enum] : EnumFilterMap,
};

const filterFactoryMap: Dictionary<FilterFunc<any,any>> = {
  [FilterType.And] : (filter: FilterInfo ): ((obj: any) => boolean) =>  {
    const filters = (filter.filterValue as FilterInfo[]).map(createFilterFunc);
    return (obj: any) : boolean => filters.every( f => f(obj));
  },
  [FilterType.In] : (filter: FilterInfo ): (obj: any) => boolean =>  {
    const filters = (filter.filterValue as FilterInfo[]).map(createFilterFunc);
    return (obj: any) : boolean => filters.some( f => f(obj));
  },
};

const filterTypeFuncMap : Dictionary<Dictionary<FilterFunc<any,any>>> = {
  [FieldType.String] : StringFilterFuncs,
  [FieldType.Array] : StringFilterFuncs,
  [FieldType.Currency] : NumberFilterFuncs,
  [FieldType.PhoneNumber] : StringFilterFuncs,
  [FieldType.Date] : DateFilterFuncs,
  [FieldType.DateTime] : DateTimeFilterFuncs,
  [FieldType.Number] : NumberFilterFuncs,
  [FieldType.Boolean] : BooleanFilterFuncs,
  [FieldType.Unknown] : StringFilterFuncs,
  [FieldType.Enum] : EnumFilterFuncs ,
  [FieldType.Link] : StringFilterFuncs,
};

export interface FilterState {
  filterId: string;
  filterType: FilterType;
  filterValue?: any;
  active?: boolean;

}

export interface FilterInfo<T extends FieldType = any> extends FilterState {
    key: string;
    fieldType: T;
    _isExternalyManaged?: boolean;
}

export interface PartialFilter<T extends FieldType = any> {
  filterId?: string;
  key: string;
  fieldType: T;
  filterType?: FilterType;
  filterValue?: any;
}



export interface CustomFilter<T extends FieldType = any>  extends FilterState {
  predicate: Predicate<T>;
  filterType: FilterType.Custom;
}

export function isCustomFilter(filter : FilterInfo | CustomFilter) :  filter is CustomFilter {
  return filter && filter.filterType === FilterType.Custom;
}

export function isFilterInfo(filter : FilterInfo | CustomFilter) :  filter is FilterInfo {
  return  filter && typeof (filter as FilterInfo).key === 'string' && filter.filterType !== FilterType.Custom;
}

const defaultPredicate: Predicate<any> = () => true;

export function createFilterFunc(filter: FilterInfo | CustomFilter): Predicate<any>  {
  if(isCustomFilter(filter)) {
    return filter.active ? filter.predicate : defaultPredicate;
  }
  if (filter.filterValue === undefined) {
    return defaultPredicate;
  }

  const func = filterTypeFuncMap[filter.fieldType][filter.filterType](filter);
  if(!func) {
    if(filterFactoryMap[filter.filterType]){
      return filterFactoryMap[filter.filterType!](filter);
    }
  }

  const cannotBeTrueForNull = !FalseyValueCanBeIncludedFilterTypes.includes(filter.filterType!);
  return (rowObj) => {
    const value = get(rowObj, filter.key);
    return ((value == undefined) && cannotBeTrueForNull)
      ? false
      : func( value);
  };
}

export type FilterFunc<T,V = T> = (filterInfo:FilterInfo) => (val:V) => boolean;
export type Range<T> = {Start:T,End:T};

const FalseyValueCanBeIncludedFilterTypes = [FilterType.IsNull,FilterType.NumberNotEqual,FilterType.DateIsNotOn,FilterType.StringDoesNotContain];
