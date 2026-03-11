import { Directive, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { HttpRequestState, HttpRequestStatus } from '../types';
import { HttpStateDirectiveBase } from './HttpStateDirectiveBase';


@Directive({ selector: '[httpNotStartedState]' })
export class HttpNotStartedStateDirective<TParam extends any[],T> extends HttpStateDirectiveBase {
    render = (state: HttpRequestState<any>) => {
        if(state.status === HttpRequestStatus.notStarted){
            this.viewContainer.createEmbeddedView(this.templateRef );
            return true;
        }
        return false;
    };

    constructor(
        injector: Injector,
        templateRef: TemplateRef<any>,
        viewContainer: ViewContainerRef,
    ) {
        super(injector,templateRef,viewContainer);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
