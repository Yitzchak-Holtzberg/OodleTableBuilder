import { PipeTransform, Injectable, inject } from '@angular/core';
import { FieldType, MetaData } from '../interfaces/report-def';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PhoneNumberPipe } from '../../utilities/pipes/phone.pipe';
import { TableBuilderConfigToken, TableBuilderConfig } from '../classes/TableBuilderConfig';
import { SpaceCasePipe } from '../../utilities';
import { get } from 'lodash';
export function isPipe(o : any ): o is PipeTransform {
  return typeof ((o as PipeTransform).transform ) === 'function';
}

@Injectable({
  providedIn:  'root',
})
export class TransformCreator {
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private phonePipe = inject(PhoneNumberPipe);
  private casePipe = inject(SpaceCasePipe);
  private config = inject<TableBuilderConfig>(TableBuilderConfigToken);

  createTransformer(metaData: MetaData): ((value: any, ...args: any[]) => any)  {
    const defaultFunc = (value: any) => get( value, metaData.key);
    if(metaData.transform) {
      if(isPipe(metaData.transform)){
        return (value: any) =>  (metaData!.transform as PipeTransform).transform(defaultFunc(value));
      }
      return metaData.fieldType === FieldType.Expression ? metaData.transform : (value: any) => (metaData.transform as (a:any,b:any)=>any)(defaultFunc(value),value);
    }
    if (this.config.transformers && this.config.transformers[metaData.fieldType]) {
      var tranformer =  this.config.transformers![metaData.fieldType]!;
      return (value: any) => tranformer(defaultFunc(value));
    }
    const defaultDateFormat = this.config.defaultSettings?.dateFormat ?? 'shortDate';
    const defaultDateTimeFormat = this.config.defaultSettings?.dateTimeFormat ?? 'short';
    switch(metaData.fieldType) {
      case FieldType.Date:
        const dateFormat = metaData.additional?.dateFormat ?? defaultDateFormat;
        return (value: any) => this.datePipe.transform(defaultFunc(value), dateFormat);
      case FieldType.DateTime:
        const dateTimeFormat = metaData.additional?.dateTimeOptions?.format ?? defaultDateTimeFormat;
        return (value: any) => this.datePipe.transform(defaultFunc(value), dateTimeFormat);
      case FieldType.Currency:
          return (value: any) =>  this.currencyPipe.transform(defaultFunc(value));
      case FieldType.PhoneNumber:
        return  (value: any) =>  this.phonePipe.transform(defaultFunc(value));
      case FieldType.Enum:
        return (value: any) =>  this.casePipe.transform(metaData.additional?.enumMap![defaultFunc(value)] as string) ;
      case FieldType.Boolean:
        let forTrue = 'check'
        let forFalse = '';
        if(metaData.additional?.boolean?.forTrue) {
          forTrue = metaData?.additional.boolean.forTrue.icon;
        }
        if(metaData.additional?.boolean?.showForFalse === true) {
          forFalse = 'clear';
        } else if (metaData.additional?.boolean?.showForFalse?.icon) {
          forFalse = metaData.additional?.boolean?.showForFalse?.icon;
        }
        return (value: any) => defaultFunc(value) ? forTrue : forFalse ;
    }
      return defaultFunc;
  }

}
