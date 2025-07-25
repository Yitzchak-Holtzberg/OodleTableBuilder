import { Dictionary } from './dictionary';
import { PipeTransform, Predicate, TemplateRef } from '@angular/core';
import { TableBuilderExport } from '../classes/TableBuilderConfig';
import { QueryParamsHandling } from '@angular/router';


export enum FieldType {
    Unknown = 0,
    Date = 1,
    Link = 2,
    ImageUrl = 3,
    Currency = 4,
    Array = 5,
    Hidden = 6,
    Number = 7,
    String = 8,
    Boolean = 9,
    PhoneNumber = 10,
    Expression = 11,
    Enum = 12,
    DateTime = 13,
}

export enum SortDirection {
    asc= 'asc',
    desc= 'desc'
}

export enum Target {
  Blank = '_blank',
  Self = '_self',
  Parent = '_parent',
  Top = '_top'
}

export interface MetaData<T = any, AdditionalFields extends string[] = []> {
  key: (keyof T | AdditionalFields[number]) & string;
  displayName?: string;
  fieldType: FieldType;
  additional?: Additional<T>;
  order?: number;
  preSort?: SortDef;
  _internalNotUserDefined?: boolean;
  width?: string;
  noExport?: boolean;
  noFilter?: boolean;
  customCell?: boolean;
  transform?: ((o: T, ...args: any[])=> any) | ((o: string, ...args: any[])=> any) | PipeTransform;
  click?: (element: T, key: string ) => void;
  template?: TemplateRef<any>;
  classes?: Dictionary<Predicate<T>>;
  toolTip?: string;
  useIcon?: boolean;
}
export interface  ReportDef<DataType = any> {
    data: DataType[];
    metaData: MetaData [];
    totalRecords?: number;
    count: number;
}

export interface SortDef {
    direction: SortDirection;
    precedence?: number;
}

export interface FilterOptions {
  filterableValues : string[]
}
export interface DateTimeOptions {
  format?: string;
  includeSeconds?: boolean;
  includeMilliseconds: boolean;
}
type interpolatedRoute = string;
export interface Additional<T = any> {
  link? : {
    base?: string;
    urlKey?: string;
    target?: Target;
    useRouterLink?: boolean;
    /**
     * If you want to use a route with interpolated params, you can use this. Wrap the property name in curly braces.
     * For example, if interpolatedRoute = /users/{id}/edit, {id} will be replaced with the value of the element's id property.
     */
    interpolatedRoute?: interpolatedRoute;
    routerLinkOptions?:{
      queryParams?: [string, interpolatedRoute][];
      fragment?: string;
      preserveFragment?: boolean;
      queryParamsHandling?: QueryParamsHandling;
    }
  }
  /**
   * @deprecated Please use link.base
   */
  base?: string;
  /**
   * @deprecated Please use link.urlKey
   */
  urlKey?: string;
  /**
   * @deprecated Please use link.target
   */
  target?: Target;
  /**
   * @deprecated Please use link.useRouterLink
   */
  useRouterLink?: boolean;
  footer?: { type: 'sum' };
  grouping?: { groupBy?: boolean, sum?: boolean; groupTitleFn?: (val: any) => string }
  export?: TableBuilderExport;
  dateFormat?: string;
  dateTimeOptions?:  DateTimeOptions;
  filterOptions?: FilterOptions;
  styles?: Dictionary<string>;
  columnPartStyles?: {
    header?: Dictionary<string>,
    body?: Dictionary<string>,
    footer?: Dictionary<string>,
  }
  enumMap?: {[key:number]:string};
  boolean? : {
    showForFalse? : true | { icon : string },
    forTrue? : { icon : string }
  }
}

export enum ArrayStyle {
  CommaDelimited,
  NewLine
}

export interface ArrayAdditional extends Additional {
    metaData?: MetaData;
    limit?: number;
    arrayStyle?: ArrayStyle;
}
