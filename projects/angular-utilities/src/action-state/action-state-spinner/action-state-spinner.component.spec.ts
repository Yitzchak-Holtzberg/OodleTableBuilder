import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActionStateSpinnerComponent } from './action-state-spinner.component';
import { serverStatusTypes } from '../ngrx';
import { CommonModule } from '@angular/common';

describe('ActionStateSpinnerComponent', () => {
  let component: ActionStateSpinnerComponent;
  let fixture: ComponentFixture<ActionStateSpinnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [CommonModule, ActionStateSpinnerComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionStateSpinnerComponent);
    component = fixture.componentInstance;
    // Provide required input
    component.status$ = of({ id: 'test', status: serverStatusTypes.notStarted });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
