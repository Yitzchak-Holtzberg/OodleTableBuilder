import { Directive, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { HttpStateDirectiveBase } from './HttpStateDirectiveBase';
import { HttpRequestState, HttpRequestStatus } from '../types'


@Directive({ selector: '[httpInProgressState]' })
export class HttpInProgressStateDirective  extends HttpStateDirectiveBase {
    render = (state: HttpRequestState<any>) => {
        if(state.status === HttpRequestStatus.inProgress){
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
