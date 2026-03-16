import { ContentChildren, Directive, QueryList } from "@angular/core";
import { TableCustomFilterDirective, TableFilterDirective } from "./tb-filter.directive";

@Directive({ selector: '[tbWrapper]' })
export class TableWrapperDirective {
  @ContentChildren(TableCustomFilterDirective, {descendants: true}) customFilters!: QueryList<TableCustomFilterDirective>;
  @ContentChildren(TableFilterDirective, {descendants: true}) filters!: QueryList<TableFilterDirective>;

  registerations : (TableCustomFilterDirective | TableFilterDirective) [] = [];

  register(filter: TableCustomFilterDirective | TableFilterDirective) {
    this.registerations.push(filter);
  }
}
