import { firstValueFrom, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestBed, ComponentFixture, ComponentFixtureAutoDetect, tick, fakeAsync, flush } from '@angular/core/testing';
import { GenFilterDisplayerComponent } from './gen-filter-displayer.component';
import { MaterialModule } from '../../../material.module';
import { SpaceCasePipe } from '../../../../utilities/pipes/space-case.pipes';
import { FilterComponent } from '../../filter/filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../../interfaces/report-def';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DateFilterComponent } from '../../date-filter/date-filter.component';
import { TableBuilderModule } from '../../../table-builder.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TableStore } from '../../../classes/table-store';
import { WrapperFilterStore } from '../table-wrapper-filter-store';


function getMetaData() {
  return of([
    {
      key: 'name',
      displayName: 'first name',
      fieldType: FieldType.String,
      additional: {},
      order: 1
    },
    {
      key: 'last',
      displayName: 'last name',
      fieldType: FieldType.String,
      additional: {},
      order: 2
    }
  ]);
}

describe('generic filter displayer', () => {
  let fixture: ComponentFixture<GenFilterDisplayerComponent>;
  let component: GenFilterDisplayerComponent;

  const clickFilter = (idx: number) => {
    const btn = fixture.debugElement.query(By.css('.filter-button')).nativeElement;

    btn.click();
    const menu = fixture.debugElement.queryAll(By.css('.mat-menu-item'));
    menu[idx].nativeElement.click();
  };
  beforeEach(() => {

    TestBed.configureTestingModule({
    providers: [TableStore, WrapperFilterStore,
        { provide: ComponentFixtureAutoDetect, useValue: true }
    ],
    imports: [
        NoopAnimationsModule,
        MaterialModule,
        CommonModule,
        FormsModule,
        TableBuilderModule.forRoot({ defaultTableState: { sorted: [] } }),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        GenFilterDisplayerComponent,
        SpaceCasePipe,
        FilterComponent,
        DateFilterComponent
    ]
})
      .compileComponents();
    fixture = TestBed.createComponent(GenFilterDisplayerComponent);
    component = fixture.componentInstance;
    component.filterCols$ = getMetaData();
  });

  it('should get the generic filter displayer component', () => {
    expect(component).toBeDefined();
  });

  it('should be able to create a filter',  async () => {
    clickFilter(0);
    const filter = await firstValueFrom(fixture.componentInstance.filterStore.state$.pipe(map(x => x.filterInfo)));
    expect(filter.length).toBe(1);
  });

});
