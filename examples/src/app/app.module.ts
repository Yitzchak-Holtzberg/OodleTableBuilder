import { BrowserModule } from '@angular/platform-browser';
import { NgModule, inject, provideAppInitializer } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableBuilderExampleComponent } from './table-builder-example/table-builder-example.component';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { EffectsModule } from '@ngrx/effects';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LowerCasePipe } from '@angular/common';
import { HttpRequestModule, setUpStoreFactory, TableBuilderModule, UtilitiesModule } from '../../../projects/angular-utilities/src/public-api';
import { FormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { ExampleEffects, exampleFeature } from './table-builder-example/actionable-selector.example';

@NgModule({
  declarations: [
    AppComponent,
    TableBuilderExampleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCheckboxModule,
    MatSelectModule,
    BrowserAnimationsModule,
    HttpRequestModule,
    StoreModule.forRoot({example: exampleFeature.reducer},{
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictStateSerializability: false,
        strictActionSerializability: false,
        strictActionWithinNgZone: false,
        strictActionTypeUniqueness: false,
      },
    }),
    EffectsModule.forRoot([ExampleEffects]),
    TableBuilderModule.forRoot({
      defaultSettings: { dateFormat: 'short' },
      defaultTableState: { pageSize: 20 },
    }),
    MatTableModule,
    UtilitiesModule,
    FormsModule,
  ],
  providers: [LowerCasePipe,
    provideAppInitializer(() => {
        const initializerFn = (setUpStoreFactory)(inject(Store));
        return initializerFn();
      }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
