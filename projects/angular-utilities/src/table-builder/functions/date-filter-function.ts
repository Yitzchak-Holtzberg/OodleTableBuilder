import { FilterFunc, FilterInfo, Range } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { FieldType } from '../interfaces/report-def';
import { isNull } from './null-filter-function';


const dateIsOnFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const isOnVal = new Date( filterInfo.filterValue).getTime();
  const clean = filterInfo.fieldType === FieldType.Date ? (a,b) => b : cleanDateTime
  return ((val)=>clean(filterInfo,val).getTime()  === isOnVal);
}

const dateIsNotOnFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const isNotOnVal = new Date( filterInfo.filterValue).getTime();
  const clean = filterInfo.fieldType === FieldType.Date ? (a,b) => b : cleanDateTime
  return ((val)=>clean(filterInfo,val).getTime()  !== isNotOnVal);
}

const dateIsOnOrAfterFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const afterVal = new Date( filterInfo.filterValue).getTime();
  const clean = filterInfo.fieldType === FieldType.Date ? (a,b) => b : cleanDateTime
  return ((val)=>clean(filterInfo,val).getTime()  >= afterVal);
}

const dateIsOnOrBeforeFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const beforeVal = new Date( filterInfo.filterValue).getTime();
  const clean = filterInfo.fieldType === FieldType.Date ? (a,b) => b : cleanDateTime
  return ((val)=>clean(filterInfo,val).getTime()  <= beforeVal);
}

const dateBetweenFunc:FilterFunc<Range<Date>,Date> = (filterInfo:FilterInfo) => {
  const startVal = new Date(filterInfo.filterValue.Start);
  const endVal = new Date(filterInfo.filterValue.End);
  const clean = filterInfo.fieldType === FieldType.Date ? (a,b) => b : cleanDateTime
  return (
    (val)=> {
      const cleanedVal = clean(filterInfo, val);
      return cleanedVal>=startVal && cleanedVal <= endVal;
    });
}

const cleanDateTime = (filterInfo:FilterInfo, val: Date) => {
  if(!!DateFilterFuncs[filterInfo.filterType]){
    const d = new Date(val);
    d.setHours(0,0,0,0);
    return d;
  }
  return val;
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
