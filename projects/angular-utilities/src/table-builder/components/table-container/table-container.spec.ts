import { BehaviorSubject, of } from 'rxjs';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe, PhoneNumberPipe,  UtilitiesModule } from '../../../utilities';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../interfaces/report-def';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { TableContainerComponent } from './table-container';
import { GenFilterDisplayerComponent } from '../table-container-filter/gen-filter-displayer/gen-filter-displayer.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenColDisplayerComponent } from '../gen-col-displayer/gen-col-displayer.component';
import { ColumnTotalPipe } from '../../pipes/column-total.pipe';
import { TableBuilder } from '../../classes/table-builder';
import { MultiSortDirective } from '../../directives/multi-sort.directive';
import { TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { provideMockStore } from '@ngrx/store/testing';
import { PaginatorComponent } from '../generic-table/paginator.component';
import {  LetModule, LetDirective, PushModule, PushPipe } from '@ngrx/component';
import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {MatTableHarness} from '@angular/material/table/testing';
import { TransformCreator } from '../../services/transform-creator';

const data = [
  {
    name: 'Joe',
    age: 10,
    balance: 25
  },
  {
    name: 'Jane',
    age: 20,
    balance: 35
  }
];
const metaData =  [
  {
    key: 'name',
    fieldType: FieldType.String,
    additional: {},
    order : 1
  },
  {
    key: 'age',
    fieldType: FieldType.Number,
    additional: {},
    order : 2
  },
  {
    key: 'balance',
    fieldType: FieldType.Number,
    additional: {},
    order : 3
  }
];

const initialState = {fullTableState: {
  'test-id': {
    metaData,
    hiddenKeys: [],
    pageSize: 10,
    initialized : true ,
    filters: [],
  }
},
globalStorageState : {
  localProfiles: {}
}};
describe('table container', () => {
  let fixture: ComponentFixture<TableContainerComponent>;
  let component: TableContainerComponent;
  let loader: HarnessLoader;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        TableContainerComponent,
        FilterComponent,
        GenFilterDisplayerComponent,
        GenericTableComponent,
        PaginatorComponent,
        GenColDisplayerComponent,
        SpaceCasePipe,
        CurrencyPipe,
        ColumnTotalPipe,
        DateFilterComponent,
        MultiSortDirective,
      ],
      providers: [
       { provide : TableBuilderConfigToken , useValue: {defaultTableState: { }}},
       provideMockStore({ initialState }),
       DatePipe,
       TransformCreator,
       CurrencyPipe,
       PhoneNumberPipe,
      ],
      imports: [
        NoopAnimationsModule,
        MaterialModule,
        CommonModule,
        FormsModule,
        LetModule,
        UtilitiesModule,
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TableContainerComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('can create component', () => {
    component.tableId = 'test-id';
    component.tableBuilder = new TableBuilder(of(data));
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('can add metadata dynamicaly after the table has already been rendered', async () => {
    const md = new BehaviorSubject(metaData);
    component.tableId = 'test-id';
    component.tableBuilder = new TableBuilder(of(data), md);

    fixture.detectChanges();
    expect(component).toBeDefined();

    const tables = await loader.getAllHarnesses(MatTableHarness);
    expect(tables.length).toBe(1);
    const table = tables[0];

    let rows = await table.getRows();

    let cells = (await parallel(() => rows.map(row => row.getCells()))).map(row => row.length);

    expect(cells).toEqual([3, 3]);

    md.next([...metaData, {
        key: 'dynamic',
        fieldType: FieldType.String,
        order : 4,
        additional: {},
    }]);

    fixture.detectChanges();

    rows = await table.getRows();

    cells = (await parallel(() => rows.map(row => row.getCells()))).map(row => row.length);

    expect(cells).toEqual([4, 4]);

  });
});
