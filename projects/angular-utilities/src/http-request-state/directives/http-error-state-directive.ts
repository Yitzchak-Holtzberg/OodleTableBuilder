import { Directive, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { isErrorState } from '../helpers';
import { HttpRequestState } from '../types';
import { HttpStateDirectiveBase } from './HttpStateDirectiveBase';

@Directive({ selector: '[httpErrorState]' })
export class HttpErrorStateDirective<TParam extends any[], T> extends HttpStateDirectiveBase {

  constructor(
    injector: Injector,
    templateRef: TemplateRef<any>,
    viewContainer: ViewContainerRef,
  ) {
    super(injector, templateRef, viewContainer);
  }

  render = (state: HttpRequestState<any>) => {
    if (isErrorState(state)) {
      this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: state.error });
      return true;
    }
    return false;
  };

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}