import { Range, FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { isNull } from './null-filter-function';

type NumberFilterFunc = FilterFunc<number>

function normalizeNumberFilterValue(v: any): number | number[] {
  if (typeof v === 'string' && v.includes(',')) {
    return v.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
  }
  return v;
}

const numberEqalsFunc: NumberFilterFunc = (filterInfo: FilterInfo<number>) => {
  const filterValue = normalizeNumberFilterValue(filterInfo.filterValue);
  if (Array.isArray(filterValue)) {
    return (val: number): boolean => filterValue.some((v: number) => val === v);
  }
  return (val: number): boolean => val === filterValue;
}

const numberNotEqualFunc: NumberFilterFunc = (filterInfo: FilterInfo<number>) => (val: number): boolean => {
  return val !== filterInfo.filterValue;
}

const numberGreaterThanFunc: NumberFilterFunc = (filterInfo: FilterInfo<number>) => (val: number): boolean => {
  return val > filterInfo.filterValue;
}

const numberLessThanFunc: NumberFilterFunc = (filterInfo: FilterInfo<number>) => (val: number): boolean => {
  return val < filterInfo.filterValue;
}

const numberBetweenFunc: FilterFunc<Range<number>, number> = (filterInfo: FilterInfo) => {
  const startVal = Number(filterInfo.filterValue.Start);
  const endVal = Number(filterInfo.filterValue.End);
  return ((val) => (val > startVal) && (val < endVal));
}

export const multipleNumberValuesEqualsFunc: FilterFunc<number[], number> = (filterInfo: FilterInfo) => {
  return ((val) => filterInfo.filterValue.some((value: any) => val === value));
}

export const NumberFilterFuncs: Dictionary<FilterFunc<any, any>> = {
  [FilterType.NumberEquals]: numberEqalsFunc,
  [FilterType.NumberNotEqual]: numberNotEqualFunc,
  [FilterType.NumberGreaterThan]: numberGreaterThanFunc,
  [FilterType.NumberLessThan]: numberLessThanFunc,
  [FilterType.NumberBetween]: numberBetweenFunc,
  [FilterType.IsNull]: isNull,
  [FilterType.In]: multipleNumberValuesEqualsFunc,
};
