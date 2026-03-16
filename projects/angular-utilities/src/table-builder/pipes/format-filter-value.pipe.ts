import { Pipe, PipeTransform } from '@angular/core';
import { TableStore } from '../classes/table-store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldType } from '../interfaces/report-def';
import { DatePipe } from '@angular/common';
import { FilterType } from '../enums/filterTypes';
import { spaceCase } from '../../utilities/pipes/space-case.pipes';
import { DateTimeFilterFuncs } from '../functions/date-filter-function';


@Pipe({ name: 'formatFilterValue' })
export class FormatFilterValuePipe implements PipeTransform {
  constructor( public tableState: TableStore , private datePipe: DatePipe) {
  }
  transform(value: any, key: string, filterType: FilterType): Observable<string> {
    return this.tableState.getMetaData$(key).pipe(
      map( md => {
        if(filterType === FilterType.IsNull) {
          return '';
        }
        if(value && (filterType === FilterType.In )){
          if(md.fieldType === FieldType.Enum) {
            return value.map( (v: any) => spaceCase(md.additional!.enumMap![v])).join(', ') ?? value;
          }
          return value.join(', ') ?? value;
        }
        if(filterType === FilterType.NumberBetween){
          return value.Start + ' - ' + value.End;
        }
        if(md.fieldType === FieldType.Date){
          return this.datePipe.transform(value, 'MM/dd/yy');
        }
        if(md.fieldType === FieldType.DateTime){
          return !!DateTimeFilterFuncs[filterType] ? this.datePipe.transform(value, 'short') : this.datePipe.transform(value, 'MM/dd/yy');
        }
        return value
      })
    );
  }
}
