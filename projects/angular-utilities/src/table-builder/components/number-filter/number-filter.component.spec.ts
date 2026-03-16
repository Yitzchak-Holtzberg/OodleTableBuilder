import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FieldType } from 'projects/angular-utilities/src/public-api';

import { NumberFilterComponent } from './number-filter.component';

describe('NumberFilterComponent', () => {
  let component: NumberFilterComponent;
  let fixture: ComponentFixture<NumberFilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberFilterComponent);
    component = fixture.componentInstance;
    component.info = {
      key: '',
      fieldType: FieldType.Unknown
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
