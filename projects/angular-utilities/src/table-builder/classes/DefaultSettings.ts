import { ArrayStyle } from '../interfaces/report-def';

export interface DefaultSettings {
  dateFormat?: string;
  dateTimeFormat?: string;
}

export const ArrayDefaults = {
  limit : 3,
  arrayStyle : ArrayStyle.CommaDelimited
}