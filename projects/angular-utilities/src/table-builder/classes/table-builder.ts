import { isObservable, Observable, of } from 'rxjs';
import { MetaData, FieldType, ReportDef } from '../interfaces/report-def';
import { first, map, switchMap } from 'rxjs/operators';
import { mapArray } from '../../rxjs/rxjs-operators';
import { GeneralTableSettings, TableBuilderSettings } from './table-builder-general-settings';
import { defaultShareReplay } from '../../rxjs';
import { get, set } from 'lodash';

export class TableBuilder<T = any> {

  metaData$: Observable<MetaData<T>[]>;
  constructor(private data$: Observable<T[]>,  metaData$?: Observable<MetaData<T,any>[]>, settings: TableBuilderSettings | Observable<TableBuilderSettings> = new GeneralTableSettings() ) {
    this.data$ = this.data$.pipe(defaultShareReplay());
    this.metaData$ = metaData$ ?
      metaData$.pipe(defaultShareReplay()) :
      data$.pipe(first(), map( data => this.createMetaData(data[0]) ),defaultShareReplay());
    const s = isObservable(settings) ? settings : of(settings);
    this.settings = s.pipe(map(sett => new GeneralTableSettings(sett)),defaultShareReplay());
  }
  settings : Observable<GeneralTableSettings>;
  getData$(): Observable<any[]> {
    return this.metaData$.pipe(
      switchMap( metaData => this.data$.pipe(
        mapArray( data => this.cleanRecord(data, metaData ) )
      ))
    );
  }

  createMetaData(obj: any): MetaData [] {
    return Object.keys(obj ?? {})
    .map( key => ({
      key,
      fieldType: FieldType.Unknown,
      order: -1
    }));
  }

  cleanVal(val: any, metaData: MetaData): any {
    switch ( metaData.fieldType ) {
      case FieldType.Currency:
      case FieldType.Number:
        const num = Number( val );
        return isNaN(num) || val == null ? null : num;
      case FieldType.Date:
        const date = Date.parse(val);
        if(isNaN(date)){
          return null;
        }
        const d = new Date(date);
        d.setHours(0,0,0,0);
        return d;
      case FieldType.DateTime: 
        const dateTime = Date.parse(val);
        if(isNaN(dateTime)){
          return null;
        }
        const dt = new Date(dateTime);
        if(metaData.additional?.dateTimeOptions?.includeMilliseconds){
          return dt;
        }
        if(metaData.additional?.dateTimeOptions?.includeSeconds){
          dt.setMilliseconds(0);
          return dt;
        }
        dt.setSeconds(0, 0);
        return dt;
    }
    return val;
  }

  cleanRecord( record: T, metadata: MetaData []): T  {
    const cleaned = metadata.reduce( (prev: T, curr: MetaData<T>) => {
      const val = this.cleanVal(get(record, curr.key), curr);
      if(val !== undefined) {
        set(prev as {}, curr.key, val);
      }
      return prev;
    }, {...record} as T )
    return {...record, ...cleaned};
  }
}

export const CreateTableBuilder = (reportDef$: Observable<ReportDef> ): TableBuilder => {
  reportDef$ = reportDef$.pipe(defaultShareReplay());
  return new TableBuilder(reportDef$.pipe(map( r => r.data) ), reportDef$.pipe( map ( r => r.metaData) ));
};
