import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import ExamplesComponent from './table-builder-example/actionable-selector.example';
import ChargebackComponent from './table-builder-example/table-builder-oodle-example';
import { TableBuilderExampleComponent } from './table-builder-example/table-builder-example.component';

const routes: Routes = [
  { path: '', redirectTo: 'table-builder-example', pathMatch: 'full' },
  { path: 'table-builder-example', component: TableBuilderExampleComponent },
  { path: 'actionable-selector-example', component: ExamplesComponent},
  { path: 'oodle-table-example', component: ChargebackComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
