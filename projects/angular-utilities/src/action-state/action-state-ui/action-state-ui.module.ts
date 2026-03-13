import { NgModule } from '@angular/core';
import { ActionStateSpinnerComponent } from '../action-state-spinner/action-state-spinner.component';

/** @deprecated Import ActionStateSpinnerComponent directly instead. */
@NgModule({
  imports: [
    ActionStateSpinnerComponent,
  ],
  exports: [
    ActionStateSpinnerComponent,
  ]
})
export class ActionStateUiModule { }
