import { FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { isNull } from './null-filter-function';


function normalizeStringFilterValue(v: any): string | string[] {
  if (typeof v === 'string' && v.includes(',')) {
    return v.split(',').map(s => s.trim()).filter(s => s);
  }
  return v;
}

const makeStringFunc = (op: (val: string, fv: string) => boolean): FilterFunc<string> =>
  (filterInfo: FilterInfo) => {
    const filterValue = normalizeStringFilterValue(filterInfo.filterValue);
    if (Array.isArray(filterValue)) {
      const vals = filterValue.map((v: string) => prepareForStringCompare(v));
      return (val) => vals.some((v: string) => op(prepareForStringCompare(val), v));
    }
    const fv = prepareForStringCompare(filterValue);
    return (val) => op(prepareForStringCompare(val), fv);
  };

const stringEqualFunc      = makeStringFunc((a, b) => a === b);
const stringContainsFunc   = makeStringFunc((a, b) => a.includes(b));
const stringStartsWithFunc = makeStringFunc((a, b) => a.startsWith(b));
const stringEndsWithFunc   = makeStringFunc((a, b) => a.endsWith(b));

const stringDoesNotContainFunc: FilterFunc<string> = (filterInfo: FilterInfo) => {
  const doesNotContainVal = prepareForStringCompare(filterInfo.filterValue);
  return ((val) => !prepareForStringCompare(val)?.includes(doesNotContainVal));
}

const multipleStringValuesEqualsFunc: FilterFunc<string[], string> = (filterInfo: FilterInfo) => {
  const filterVals = filterInfo.filterValue.map((v: string) => prepareForStringCompare(v));
  return ((val) => filterVals.some((s: string) => prepareForStringCompare(val) === s));
}

export const StringFilterFuncs: { [k: string]: FilterFunc<any, any> } = {
  [FilterType.StringEquals]: stringEqualFunc,
  [FilterType.StringContains]: stringContainsFunc,
  [FilterType.StringDoesNotContain]: stringDoesNotContainFunc,
  [FilterType.StringStartWith]: stringStartsWithFunc,
  [FilterType.StringEndsWith]: stringEndsWithFunc,
  [FilterType.IsNull]: isNull,
  [FilterType.In]: multipleStringValuesEqualsFunc,
};

export const EnumFilterFuncs: Dictionary<FilterFunc<any, any>> = {
  [FilterType.IsNull]: isNull,
  [FilterType.In]: multipleStringValuesEqualsFunc,
};

export const prepareForStringCompare = (val: any): string => val?.toString().trim().toLowerCase();
