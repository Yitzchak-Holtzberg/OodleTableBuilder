import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { TableStore } from '../../classes/table-store';
import { SortDirection } from '../../interfaces/report-def';
import { SortMenuComponentStore, SortWithName } from './sort-menu.component-store'

@Component({
    selector: 'tb-sort-menu',
    templateUrl: './sort-menu.component.html',
    styleUrls: ['./sort-menu.component.scss'],
    providers: [SortMenuComponentStore],
    standalone: false
})
export class SortMenuComponent implements OnInit{

  sorted$:Observable<SortWithName[]>;
  notSorted$:Observable<SortWithName[]>;
  SortDirection = SortDirection;
  dirty$ = new BehaviorSubject(false);
  constructor(private tableState: TableStore, public store: SortMenuComponentStore) {
    this.sorted$=this.store.sorted$.pipe(map(data=>[...data]));
    this.notSorted$=this.store.notSorted$.pipe(map(data=>[...data]));
  }

  reset(){
    this.dirty$.next(false);
    this.store.reset();
  }

  ngOnInit(){
    this.store.reset();
  }

  addSort(sort: SortWithName) {
    this.dirty$.next(true);
    this.store.sorted$.pipe(first()).subscribe(sorted => {
      this.store.setSorted([...sorted, { ...sort, direction: SortDirection.asc }]);
    });
    this.store.notSorted$.pipe(first()).subscribe(notSorted => {
      this.store.setNotSorted(notSorted.filter(s => s.active !== sort.active));
    });
  }

  removeSort(sort: SortWithName) {
    this.dirty$.next(true);
    this.store.sorted$.pipe(first()).subscribe(sorted => {
      this.store.setSorted(sorted.filter(s => s.active !== sort.active));
    });
    this.store.notSorted$.pipe(first()).subscribe(notSorted => {
      this.store.setNotSorted([...notSorted, sort]);
    });
  }

  toggleDirection(sort: SortWithName) {
    this.dirty$.next(true);
    const newDirection = sort.direction === SortDirection.asc ? SortDirection.desc : SortDirection.asc;
    this.store.setDirection({ ...sort, direction: newDirection });
  }

  apply = this.store.effect((obs:Observable<null>)=>
    obs.pipe(tap(()=>{
      this.dirty$.next(false);
      this.tableState.setAllSort(this.store.sorted$.pipe(first()))
  })));

  setDirection(sort:SortWithName){
    this.dirty$.next(true);
    this.store.setDirection(sort);
  }

}
