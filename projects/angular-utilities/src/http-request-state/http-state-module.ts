import { NgModule } from '@angular/core';
import { HttpSuccessStateDirective } from './directives/http-success-state-directive';
import { HttpRequestStateDirective } from './directives/request-state-directive';
import { HttpErrorStateDirective } from './directives/http-error-state-directive';
import { HttpInProgressStateDirective } from './directives/http-inProgress-state-directive';
import { HttpNotStartedStateDirective } from './directives/http-notStarted-state-directive';

/** @deprecated Import the standalone directives directly instead. */
@NgModule({
    imports: [
        HttpSuccessStateDirective,
        HttpRequestStateDirective,
        HttpErrorStateDirective,
        HttpInProgressStateDirective,
        HttpNotStartedStateDirective,
    ],
    exports: [
        HttpSuccessStateDirective,
        HttpRequestStateDirective,
        HttpErrorStateDirective,
        HttpInProgressStateDirective,
        HttpNotStartedStateDirective,
    ]
}) export class HttpRequestModule {

}
