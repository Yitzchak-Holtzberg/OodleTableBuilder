import { FilterFunc, FilterInfo, Range } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { FieldType } from '../interfaces/report-def';
import { isNull } from './null-filter-function';

/**
 * Parse any date-ish value into a local-midnight Date.
 *
 * Handles three trap cases:
 *  1. Date-only ISO ("2026-05-06") — `new Date()` parses as UTC midnight, so a US-East
 *     user comparing against a row at local midnight would shift by a day. We parse
 *     YYYY-MM-DD explicitly to local midnight instead.
 *  2. String row values like "2026/05/06" or ".NET DateTime" ("2026-05-06T00:00:00") —
 *     the previous code path called `.getTime()` directly on strings (returned
 *     undefined for FieldType.Date). We always pass through `new Date()`.
 *  3. Date objects with embedded time — we strip to local midnight so date-only filters
 *     match regardless of time-of-day in the row.
 */
const toLocalMidnight = (v: any): Date | null => {
  if (v == null || v === '') return null;
  // YYYY-MM-DD or YYYY/MM/DD prefix — parse the date components explicitly so the
  // result is local midnight (not UTC midnight). Covers `<input type="date">` output
  // and slash-separated date strings used in some example/seed data.
  if (typeof v === 'string') {
    const m = v.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }
  }
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * For DateTime fields with a DateTime filter (Is At, At Or After, etc.) we keep the
 * full timestamp. Date-style filters (Is On, etc.) on either Date or DateTime fields
 * normalize both sides to local midnight via toLocalMidnight().
 */
const normalize = (filterInfo: FilterInfo, val: any): Date | null => {
  // DateTime filters need exact timestamp; just coerce to Date.
  if (filterInfo.fieldType === FieldType.DateTime && !DateFilterFuncs[filterInfo.filterType]) {
    if (val == null || val === '') return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return toLocalMidnight(val);
};

const dateIsOnFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const isOnVal = normalize(filterInfo, filterInfo.filterValue)?.getTime();
  return ((val)=> normalize(filterInfo, val)?.getTime() === isOnVal);
}

const dateIsNotOnFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const isNotOnVal = normalize(filterInfo, filterInfo.filterValue)?.getTime();
  return ((val)=> normalize(filterInfo, val)?.getTime() !== isNotOnVal);
}

const dateIsOnOrAfterFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const afterVal = normalize(filterInfo, filterInfo.filterValue)?.getTime();
  return ((val)=> {
    const t = normalize(filterInfo, val)?.getTime();
    return t !== undefined && afterVal !== undefined && t >= afterVal;
  });
}

const dateIsOnOrBeforeFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const beforeVal = normalize(filterInfo, filterInfo.filterValue)?.getTime();
  return ((val)=> {
    const t = normalize(filterInfo, val)?.getTime();
    return t !== undefined && beforeVal !== undefined && t <= beforeVal;
  });
}

const dateBetweenFunc:FilterFunc<Range<Date>,Date> = (filterInfo:FilterInfo) => {
  const startVal = normalize(filterInfo, filterInfo.filterValue.Start)?.getTime();
  const endVal = normalize(filterInfo, filterInfo.filterValue.End)?.getTime();
  return ((val)=> {
    const t = normalize(filterInfo, val)?.getTime();
    return t !== undefined && startVal !== undefined && endVal !== undefined && t >= startVal && t <= endVal;
  });
}

export const DateFilterFuncs: Dictionary<FilterFunc<any,any>> = {
    [FilterType.DateIsOn]: dateIsOnFunc,
    [FilterType.DateIsNotOn]: dateIsNotOnFunc,
    [FilterType.DateOnOrAfter]: dateIsOnOrAfterFunc,
    [FilterType.DateOnOrBefore]: dateIsOnOrBeforeFunc,
    [FilterType.DateBetween]: dateBetweenFunc,
    [FilterType.IsNull]: isNull,
};

export const DateTimeFilterFuncs: Dictionary<FilterFunc<any,any>> = {
  ...DateFilterFuncs,
  [FilterType.DateTimeIsAt]: dateIsOnFunc,
  [FilterType.DateTimeIsNotAt]: dateIsNotOnFunc,
  [FilterType.DateTimeAtOrAfter]: dateIsOnOrAfterFunc,
  [FilterType.DateTimeAtOrBefore]: dateIsOnOrBeforeFunc,
  [FilterType.DateTimeBetween]: dateBetweenFunc,
  [FilterType.IsNull]: isNull,
};
