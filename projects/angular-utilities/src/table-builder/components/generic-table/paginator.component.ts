import { Component, ChangeDetectionStrategy, ElementRef, AfterViewInit, OnInit, input, output, viewChild, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { asyncScheduler, merge, Observable } from 'rxjs';
import { delay, distinct, distinctUntilKeyChanged, map } from 'rxjs/operators';
import { GenericTableDataSource } from '../../classes/GenericTableDataSource';
import { TableStore } from '../../classes/table-store';
import { NgClass, AsyncPipe } from '@angular/common';
@Component({
    selector: 'tb-paginator',
    template: `
  @if (currentPageData$ | async; as pageData) {
    <div [ngClass]="{'hide' : !(collapseFooter$ | async), 'page-amounts':true}">
      {{pageData.currentStart}} - {{pageData.currentEnd}} of {{pageData.total}}
    </div>
  }
  <mat-paginator [pageSizeOptions]="[5, 10, 20, 50, 100, 500]" showFirstLastButtons (page)="paginatorChange()"
    [ngClass]="{'hide' : (collapseFooter$ | async)}" />
  `,
    styleUrls: ['./generic-table.component.scss', '../../styles/collapser.styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, MatPaginator, AsyncPipe]
})
export class PaginatorComponent implements OnInit, AfterViewInit{
  private state = inject(TableStore);

  readonly dataSource = input.required<GenericTableDataSource<any>>();
  readonly tableElRef = input.required<ElementRef>();
  readonly paginator = viewChild.required(MatPaginator);
  currentPageData$!: Observable<CurrentPageDetails>;
  collapseFooter$!:Observable<boolean>;
  readonly data$ = input.required<Observable<any[]>>();
  readonly paginatorChangeEmitter = output<void>();
  ngOnInit(){
    this.dataSource().paginator = this.paginator();
    this.ourPageEvent = true;
    const paginator = this.paginator();
    this.state.on(metaDataPageSizeChange(this.state), setPaginatorPageSize(paginator));
    this.state.setPageSize(onPagiantorPageSizeChange(paginator));
    this.collapseFooter$ = this.state.state$.pipe(map(state => state.persistedTableSettings.collapseFooter));

  }
  ngAfterViewInit(){
    this.currentPageData$ = merge(
      this.paginator().page.pipe(map(mapPaginationEventToCurrentPageDetails)),
      this.data$().pipe(
        distinctUntilKeyChanged("length"),
        delayToAllowForProperUpdate,
        map(updateCurrentPageDetailsOnDataLengthChange(this.paginator())))
    );
  }

  paginatorChange() : void {
    this.paginatorChangeEmitter.emit();
    if(!this.ourPageEvent){
      /* The purpose of this line of code is to scroll to the top of the rows when the user changes the page, but it determines the "top" by
      looking at the rendered rows, which is not the top of the table when using virtual scrolling.  Commenting out until we have a different solution */
      //setTimeout(() => this.tableElRef?.nativeElement?.scrollIntoView(), 0);
    } else {
      this.ourPageEvent = false;
    }
  }
  ourPageEvent = false;

}

const mapPaginationEventToCurrentPageDetails = (pageData: PageEvent):CurrentPageDetails => ({
  currentStart : (pageData.pageIndex * pageData.pageSize) + 1,
  currentEnd : Math.min(pageData.length , ((pageData.pageIndex + 1) * pageData.pageSize)),
  total : pageData.length
});

const updateCurrentPageDetailsOnDataLengthChange = (paginator:MatPaginator) => () => ({currentStart:(paginator.pageIndex * paginator.pageSize) + 1,
  currentEnd: Math.min(paginator.length , ((paginator.pageIndex + 1) * paginator.pageSize)),
  total:paginator.length})

const delayToAllowForProperUpdate = delay<any[]>(0,asyncScheduler);

interface CurrentPageDetails {
  currentStart:number,
  currentEnd:number,
  total:number
}

const metaDataPageSizeChange = (state:TableStore) => state.state$.pipe(map(state => state.pageSize),distinct());

const setPaginatorPageSize = (paginator:MatPaginator) => (pageSize: number) =>
  paginator._changePageSize(pageSize);

const onPagiantorPageSizeChange = (paginator: MatPaginator) => paginator.page.pipe(map( e => e.pageSize ), distinct());
