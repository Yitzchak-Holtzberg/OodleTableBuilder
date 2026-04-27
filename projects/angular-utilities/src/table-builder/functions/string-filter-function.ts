import { FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { isNull } from './null-filter-function';
import { splitCommaValue } from './split-comma-value';
import { hasWildcard, wildcardToRegex, WildcardAnchor } from './wildcard-to-regex';


type LiteralOp = (val: string, fv: string) => boolean;
type SegmentMatcher = (preppedVal: string) => boolean;

const makeSegmentMatcher = (segment: unknown, anchor: WildcardAnchor, literalOp: LiteralOp): SegmentMatcher => {
  const prepped = prepareForStringCompare(segment);
  if (hasWildcard(prepped)) {
    const re = wildcardToRegex(prepped, anchor);
    return (val) => re.test(val);
  }
  return (val) => literalOp(val, prepped);
};

const makeStringFunc = (anchor: WildcardAnchor, literalOp: LiteralOp): FilterFunc<string> =>
  (filterInfo: FilterInfo) => {
    const filterValue = splitCommaValue(filterInfo.filterValue);
    const segments = Array.isArray(filterValue) ? filterValue : [filterValue];
    const matchers = segments.map(seg => makeSegmentMatcher(seg, anchor, literalOp));
    return (val) => {
      const prepped = prepareForStringCompare(val) ?? '';
      return matchers.some(m => m(prepped));
    };
  };

const stringEqualFunc      = makeStringFunc('both',  (a, b) => a === b);
const stringContainsFunc   = makeStringFunc('none',  (a, b) => a.includes(b));
const stringStartsWithFunc = makeStringFunc('start', (a, b) => a.startsWith(b));
const stringEndsWithFunc   = makeStringFunc('end',   (a, b) => a.endsWith(b));

const stringDoesNotContainFunc: FilterFunc<string> = (filterInfo: FilterInfo) => {
  const match = makeSegmentMatcher(filterInfo.filterValue, 'none', (a, b) => a.includes(b));
  return (val) => !match(prepareForStringCompare(val) ?? '');
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
