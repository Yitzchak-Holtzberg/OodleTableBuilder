import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GroupByListComponent } from './group-by-list.component';
import { TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe } from '../../../utilities/pipes/space-case.pipes';

describe('GroupByListComponent', () => {
  let component: GroupByListComponent;
  let fixture: ComponentFixture<GroupByListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    providers: [
        { provide: TableBuilderConfigToken, useValue: { defaultTableState: {} } },
        provideMockStore({ initialState: { fullTableState: {} } }),
    ],
    imports: [MaterialModule, GroupByListComponent, SpaceCasePipe]
})
    .compileComponents();

    fixture = TestBed.createComponent(GroupByListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
