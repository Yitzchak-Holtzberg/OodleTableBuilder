import { Component, TemplateRef, ViewEncapsulation, viewChild, inject } from '@angular/core';
import { Subject, Observable, of, ReplaySubject } from 'rxjs';
import { scan, startWith, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { LowerCasePipe, NgClass, AsyncPipe, JsonPipe } from '@angular/common';
import { ArrayAdditional, ArrayStyle, MetaData, FieldType, TableBuilder, TableContainerComponent, TableBuilderModule, FilterType, GeneralTableSettings, Target, SortDirection, HttpRequestStateFactory } from '../../../../projects/angular-utilities/src/public-api';
import { UtilitiesModule } from '../../../../projects/angular-utilities/src/utilities';
import { combineArrays } from '../../../../projects/angular-utilities/src/rxjs';
import { FilterInfo } from '../../../../projects/angular-utilities/src/table-builder/classes/filter-info';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatColumnDef, MatFooterCellDef, MatFooterCell, MatCellDef, MatCell, MatHeaderCellDef, MatHeaderCell, MatRowDef, MatRow } from '@angular/material/table';

enum Weight {
  hi, loFlow, med,
}

export interface PeriodicElement {
  name: string | null | undefined;
  position: number | null | undefined;
  weight: number;
  symbol: string;
  gas: boolean;
  date: Date| null| undefined;
  dateTime?: Date| null| undefined;
  moreInfo?: string []
  phone: string | null| undefined;
  W? : Weight;
  price?: number;
  icon?: string;
  nested? : any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, nested : { 'thing1': '1', 'thing2': '2'}, price: -100, icon: 'home',dateTime: new Date(2021, 6, 6, 11 ,4 ,30), name: 'Hydrogen', weight: 1.0079, symbol: 'H', gas: true , date: new Date(2021, 6, 8, 10 ,4), phone: null,moreInfo: ['hello','world' ] , W: Weight.hi  },
  {position: 2, nested : { 'thing1': 'b', thing2: 'c'}, price: 0, icon: 'delete', name: 'Helium', weight: 4.0026, symbol: 'He', gas: true, date: null, phone: undefined , moreInfo: ['can', 'you', 'see', 'me'], W: Weight.loFlow},
  {position: 3, nested : { thing1: 'e', 'thing2': 'd'}, price: 100, icon: 'user', name: 'Lithium', weight: 6.941, symbol: 'Li', gas: false, date: new Date(2021, 6, 5, 10 ,4), phone: '       ' , W: Weight.hi},
  {position: undefined, nested : { 'thing1': '1', 'thing2': '2'}, name: 'Beryllium', weight: 9.0122, symbol: 'Be', gas: false, date: new Date(2021, 1, 4, 10 ,4), phone: '2341185656', moreInfo: [] , W: Weight.hi},
  {position: 5, name: '', weight: 9.811, symbol: 'B', gas: false, date: new Date(2021, 6, 3),  phone: '234' , W: Weight.hi},
  {position: 6, name: undefined, weight: 12.0107, symbol: 'C', gas: false, date: new Date(2021, 6, 6, 10 ,4), dateTime: new Date(2021, 6, 6, 12 ,4,30), phone: '2346783425' , moreInfo: ['hi'] , W: Weight.loFlow},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', gas: true, date: new Date(2021, 6, 7, 10 ,4), dateTime: new Date(2021, 6, 6, 4 ,4,30),phone: '23909085656' , W: Weight.hi},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', gas: false, date: new Date(2021, 6, 1, 10 ,4), phone: '8456782345', W: Weight.hi },
  {position: 9, name: 'Neon', weight: 20.1797, symbol: 'Ne', gas: true, date: undefined, phone: '2341234456' , W: Weight.med},
  {position: null, name: null, weight: 18.9984, symbol: 'F', gas: false, date: new Date(2021, 6, 9), phone: '123456789012' },
];


const additional: ArrayAdditional = {
  arrayStyle: ArrayStyle.NewLine,
};

const allKeys = Object.keys(Weight);
const keys = allKeys.slice(0, allKeys.length / 2);
const WeightMap = keys.reduce((prev,key )=> {
  prev[key] = Weight[key];
  return prev;
},{});

const META_DATA: MetaData<PeriodicElement, ['expression']>[] = [
  // {key: 'position', fieldType: FieldType.Number, order: 3, transform: (a)=>a, additional : {footer:{type : 'sum' }} , toolTip: 'if you need help' },
  // {key: 'nested.thing1' as any, fieldType: FieldType.String },
  // {key: 'nested.thing2' as any, fieldType: FieldType.String },
  // {key: 'symbol', order:2, fieldType: FieldType.String,
  //   classes: {
  //     'some-class': (o) => o.name === 'Neon',
  //     'makeMeBlue': _ => true,
  //   },
  //   additional: {columnPartStyles:{body:{color: 'rgb(194 210 67 / 61%)'}}}, },
  // {key: 'icon', fieldType: FieldType.String, useIcon: true},
  {key: 'dateTime', fieldType: FieldType.DateTime , displayName: 'Date Time',
    preSort: {direction: SortDirection.asc, precedence: 1},
    additional: {columnPartStyles: {footer:{color: 'rgb(194 210 67 / 61%)'}}},
    click: (element, key) => console.log(element,key)
  },
  {key: 'date', fieldType: FieldType.Date , displayName: 'The Date',
    preSort: {direction: SortDirection.asc, precedence: 1},
    additional: {dateFormat: 'shortDate',columnPartStyles: {footer:{color: 'rgb(194 210 67 / 61%)'}}},
    click: (element, key) => console.log(element,key)
  },
  {key: 'name', order: 1,fieldType: FieldType.Link,
    toolTip: 'this is interesting',
    additional: {
      export: { prepend: "'" },
      // link:{interpolatedRoute:'https://google.com/search?q={name} or {symbol} or {gas} or {nested.thing1}'},
      link:{interpolatedRoute:'/search' ,useRouterLink: true,
        routerLinkOptions: {queryParams: [['q', '{name} or {symbol} or {gas} or {nested.thing1}']], fragment: '1'}},
      // link:{interpolatedRoute:'/', useRouterLink: true, target: Target.Self},
      // link:{base:'https://en.wikipedia.org/wiki/',urlKey: 'name'},
      // link:{base:'https://en.wikipedia.org/wiki',urlKey: 'name', target: Target.Self},
      filterOptions: { filterableValues : ['Oxygen', 'Nitrogen','Neon']},

    },
    transform: (o) => o + ' #'
  },
  {key: 'gas', fieldType: FieldType.Boolean , additional: {
    styles: {  maxWidth:'40px'},
    boolean : {showForFalse : {icon : 'disabled_visible'}, forTrue : {icon:'visibility'}},
  } },
  {key: 'phone', fieldType: FieldType.PhoneNumber, order:undefined },
  {key: 'moreInfo', fieldType: FieldType.Array, additional},
  {key:'expression', fieldType: FieldType.Expression, displayName:'Expressify',
    transform: (o: PeriodicElement) => o.symbol + ' my symbol ' + (o.name ??''),
    additional: {
      styles: {color: 'green', flex: '0 0 200px'},
      columnPartStyles:{header:{color: 'rgb(194 210 67 / 61%)'}}
    },
    click: (element, key) => console.log(element,key)
  },
  {key: 'W', fieldType: FieldType.Enum, additional: { enumMap: WeightMap }},
  {key: 'price', fieldType: FieldType.Currency },
];



@Component({
    selector: 'app-table-builder-example',
    templateUrl: './table-builder-example.component.html',
    styleUrls: ['./table-builder-example.component.css'],
    providers: [HttpRequestStateFactory],
    encapsulation: ViewEncapsulation.None,
    imports: [TableBuilderModule, UtilitiesModule, MatCheckbox, MatFormField, MatSelect, MatOption, FormsModule, NgClass, MatColumnDef, MatFooterCellDef, MatFooterCell, MatCellDef, MatCell, MatHeaderCellDef, MatHeaderCell, MatRowDef, MatRow, AsyncPipe, JsonPipe]
})
export class TableBuilderExampleComponent {
  private store = inject<Store<any>>(Store);
  private lcp = inject(LowerCasePipe);
  private reqfac = inject(HttpRequestStateFactory);

  req = this.reqfac.create(() => of([1,2,3]))
  FilterTypes = FilterType;
  FieldTypes = FieldType;
  public tableBuilder!: TableBuilder;
  newElement$ = new Subject<PeriodicElement>();
  metaData$ = new ReplaySubject<MetaData<PeriodicElement, ['expression']>[]>();
  myFilter = new Subject<Array<(val: PeriodicElement) => boolean>>();
  s$ = new Subject();

  myTestPredicate = (o) => o.name === 'Oxygen';

  readonly tableContainer = viewChild.required(TableContainerComponent);

  readonly t = viewChild.required<TemplateRef<any>>('myTemplate');

  isFilterChecked!: Observable<FilterInfo>;
  runWhen = ()=>true;


  emitter(d)
  {
    //console.log(d);
  }

  getLotsOfData() {
    let lotsOfData: PeriodicElement[] = [];
    for (let i = 0; i < 1000; i++) {
      lotsOfData.push(...ELEMENT_DATA);
    }
    return lotsOfData;
  }

  ngAfterViewInit() {
    const addedElements = this.newElement$.pipe(
      scan((acc, value) => { acc.push(value); return acc; }, [] as PeriodicElement[]),
      startWith([]),
    );
    // META_DATA[3].template = this.t;
    const all = combineArrays([of(ELEMENT_DATA), addedElements]);
    this.metaData$.next(META_DATA);

    setTimeout(() => {
      this.tableBuilder = new TableBuilder(
        all,

      this.metaData$,


      // .pipe(delay(5000))
      // of(
        {headerSettings:{hideHeader: false},
        columnHeaderSettings:{noFilters:false}
      } as GeneralTableSettings
      // )
        // .pipe(shareReplay({bufferSize:1,refCount:true}))
      );
      //this.isFilterChecked = this.tableContainer.state.getFilter$('test')
      //this.isFilterChecked.subscribe();
    }, 0);
  }

  addColumn() {
    this.metaData$.next([...META_DATA.filter( f => f.key !== 'gas'), {key: 'new', fieldType: FieldType.String, order: 10, additional: {columnPartStyles:{body:{color: 'rgb(194 210 67 / 61%)'}}}} as any]);
  }

  addItem() {
    this.newElement$.next({
      position: 11, name: 'Gold', weight: 196.96657 , symbol: 'Au', gas: false, date: new Date(), phone:'5675675678', W: Weight.hi
    });

    this.metaData$.next(META_DATA);
  }

  emitFilter() {
    this.myFilter.next(
      [
        element => !!element.name?.includes('B')
      ]
    );
  }

  clearFilter() {
    this.myFilter.next([]);
  }

  Checked(input: MatCheckboxChange) {
    if (input.checked) {
      const fi = {
        filterId: 'test',
        filterType: FilterType.NumberEquals,
        filterValue: 5,
        key: 'position',
        fieldType: FieldType.Number
      };
      this.tableContainer().state.addFilter(fi);
    } else {
      this.tableContainer().state.removeFilter('test');
    }
  }

  multipleValuesTest(change: MatSelectChange) {
    const fi = {
      filterId: 'multipleValuesTest',
      filterType: FilterType.In,
      filterValue: change.value.map(v => {
        //console.log(v)
        return v}),
      key: 'name',
      fieldType: FieldType.String
    }

    this.tableContainer().state.addFilter(fi);
  }

  selectionEvent(a){
    console.log('selection emit: ', a)
  }

  clearAllFilters(){
    this.tableContainer().state.clearFilters()
  }
}
