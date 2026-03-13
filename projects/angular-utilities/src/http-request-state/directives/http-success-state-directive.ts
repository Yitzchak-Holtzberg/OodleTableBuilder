import { Directive, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { isSuccessState } from '../helpers';
import { HttpStateDirectiveBase } from './HttpStateDirectiveBase';
import { HttpRequestState } from '../types';
import { HttpRequestStateStore } from '../HttpRequestStateStore';
import { Observable } from 'rxjs';

export interface HttpSuccessStateViewContext<T> {
  $implicit: T;
}
@Directive({ selector: '[httpSuccessState]' })
export class HttpSuccessStateDirective<T> extends HttpStateDirectiveBase {
  @Input() httpSuccessStateTypeSafety?: HttpRequestStateStore<any, T> | Observable<HttpRequestState<T>>;
  render = (state: HttpRequestState<T>) => {
    if (isSuccessState(state)) {
      this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: state.body });
      return true;
    }
    return false;
  };
  constructor(
    injector: Injector,
    templateRef: TemplateRef<{ $implicit: T }>,
    viewContainer: ViewContainerRef,
  ) {
    super(injector, templateRef, viewContainer);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  static ngTemplateContextGuard<T>(dir: HttpSuccessStateDirective<T>, ctx: any): ctx is HttpSuccessStateViewContext<T> {
    return true;
  }
}
