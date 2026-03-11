
import { enableProdMode, provideAppInitializer, inject, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { LowerCasePipe } from '@angular/common';
import { setUpStoreFactory, HttpRequestModule, TableBuilderModule, UtilitiesModule } from '../../projects/angular-utilities/src/public-api';
import { Store, StoreModule } from '@ngrx/store';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { provideAnimations } from '@angular/platform-browser/animations';
import { exampleFeature, ExampleEffects } from './app/table-builder-example/actionable-selector.example';
import { EffectsModule } from '@ngrx/effects';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, MatCheckboxModule, MatSelectModule, HttpRequestModule, StoreModule.forRoot({ example: exampleFeature.reducer }, {
            runtimeChecks: {
                strictStateImmutability: false,
                strictActionImmutability: false,
                strictStateSerializability: false,
                strictActionSerializability: false,
                strictActionWithinNgZone: false,
                strictActionTypeUniqueness: false,
            },
        }), EffectsModule.forRoot([ExampleEffects]), TableBuilderModule.forRoot({
            defaultSettings: { dateFormat: 'short' },
            defaultTableState: { pageSize: 20 },
        }), MatTableModule, UtilitiesModule, FormsModule),
        LowerCasePipe,
        provideAppInitializer(() => {
            const initializerFn = (setUpStoreFactory)(inject(Store));
            return initializerFn();
        }),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
