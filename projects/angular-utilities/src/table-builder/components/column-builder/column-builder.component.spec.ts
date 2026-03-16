import { ComponentFixture, ComponentFixtureAutoDetect, TestBed, waitForAsync } from '@angular/core/testing';
import { ColumnBuilderComponent } from './column-builder.component';
import { FieldType } from '../../interfaces/report-def';
import { TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe } from '../../../utilities/pipes/space-case.pipes';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PhoneNumberPipe } from 'projects/angular-utilities/src/utilities';
import { MatTable } from '@angular/material/table';

const initialState = {fullTableState: {
  'test-id': {
    metaData: [],
    hiddenKeys: [],
    pageSize: 10,
    initialized : true ,
  }
}};


describe('ColumnBuilderComponent', () => {
  let component: ColumnBuilderComponent;
  let fixture: ComponentFixture<ColumnBuilderComponent>;

  beforeEach(waitForAsync(() => {
     TestBed.configureTestingModule({
    providers: [
        { provide: TableBuilderConfigToken, useValue: { defaultTableState: {} } },
        { provide: MatTable, useValue: { addColumnDef: (colDef) => { } } },
        provideMockStore({ initialState }),
        DatePipe,
        CurrencyPipe,
        PhoneNumberPipe,
    ],
    imports: [MaterialModule, ColumnBuilderComponent, SpaceCasePipe]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnBuilderComponent);
    component = fixture.componentInstance;
    component.metaData = { key: 'key', fieldType: FieldType.String };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
