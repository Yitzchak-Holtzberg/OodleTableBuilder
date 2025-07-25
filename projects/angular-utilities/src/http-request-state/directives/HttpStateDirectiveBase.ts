import { Directive, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { HttpRequestState } from '../types';
import { HttpRequestStateDirective } from './request-state-directive';

@Directive()
export abstract class HttpStateDirectiveBase {
    hasView = false;
    constructor(
        private injector: Injector,
        protected templateRef: TemplateRef<any>,
        protected viewContainer: ViewContainerRef,
    ) {

    }

    ngOnInit() {
        const parent = this.injector.get(HttpRequestStateDirective);
        if(parent == null) {
            throw new Error('You can only use an http state directive as a child of the httpRequestState directive.');
        }
        parent.hooks.push(this.baseRender);
        this.baseRender(parent.ViewContext.state);
    }

    ngOnDestroy() {
        
    }

    private baseRender = (state:HttpRequestState ) : void => {
        if (this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
        this.hasView = this.render(state);
    }

    abstract render: (state: HttpRequestState) => boolean;
}
