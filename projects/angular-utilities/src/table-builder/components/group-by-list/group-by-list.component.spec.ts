import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupByListComponent } from './group-by-list.component';

describe('GroupByListComponent', () => {
  let component: GroupByListComponent;
  let fixture: ComponentFixture<GroupByListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupByListComponent ]
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
