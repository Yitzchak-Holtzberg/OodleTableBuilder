import { InjectionToken } from '@angular/core';
import { TableState } from './TableState';
import { DefaultSettings } from './DefaultSettings';
import { ArrayAdditional, FieldType } from '../interfaces/report-def';
export interface TableBuilderConfig {
  defaultTableState: Partial<TableState>;
  export?: TableBuilderExport;
  defaultSettings?: DefaultSettings;
  arrayInfo?: ArrayAdditional;
  transformers?: Partial<{ [key in keyof typeof FieldType]: (val: any) => any }>
}

export interface TableBuilderExport {
  dateFormat?: string;
  dateTimeFormat?: string;
  onSave?: (event?: any) => void;
  prepend? : string;
}

export const TableBuilderConfigToken = new InjectionToken<TableBuilderConfig>('TableBuilderConfig');
