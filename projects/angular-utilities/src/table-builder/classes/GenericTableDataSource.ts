import { Observable } from 'rxjs';
import { MultiSortDirective } from '../directives/multi-sort.directive';
import { MatTableObservableDataSource, TableVirtualScrollObservableDataSource } from './MatTableObservableDataSource'
import { sortData } from '../functions/sort-data-function';
import { MatSort } from '@angular/material/sort';

export type GenericTableDataSourceType<T> = GenericTableDataSource<T> | GenericTableVirtualScrollDataSource<T>;

export function isMultiSort(sort: MatSort): sort is MultiSortDirective {
    return Array.isArray((sort as MultiSortDirective ).rules);
}

export class GenericTableDataSource<T> extends MatTableObservableDataSource<T>
{

  constructor(dataSrc: Observable<T[]>)
  {
    super(dataSrc);

    const baseSort = this.sortData;
    this.sortData = ((data: T[], sort:  MatSort) => isMultiSort(sort) ?  sortData(data, sort.rules) : baseSort(data, sort));
  }
}

export class GenericTableVirtualScrollDataSource<T> extends TableVirtualScrollObservableDataSource<T>
{

  constructor(dataSrc: Observable<T[]>)
  {
    super(dataSrc);

    const baseSort = this.sortData;
    this.sortData = ((data: T[], sort:  MatSort) => isMultiSort(sort) ?  sortData(data, sort.rules) : baseSort(data, sort));
  }
}
