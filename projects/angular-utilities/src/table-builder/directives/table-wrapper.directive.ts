import { Directive, contentChildren } from "@angular/core";
import { TableCustomFilterDirective, TableFilterDirective } from "./tb-filter.directive";

@Directive({ selector: '[tbWrapper]' })
export class TableWrapperDirective {
  readonly customFilters = contentChildren(TableCustomFilterDirective, { descendants: true });
  readonly filters = contentChildren(TableFilterDirective, { descendants: true });

  registerations : (TableCustomFilterDirective | TableFilterDirective) [] = [];

  register(filter: TableCustomFilterDirective | TableFilterDirective) {
    this.registerations.push(filter);
  }
}
