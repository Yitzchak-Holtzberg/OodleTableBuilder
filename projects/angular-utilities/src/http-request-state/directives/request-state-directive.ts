import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { defaultShareReplay } from '../../rxjs/defaultShareReplay';
import { isObservable, Observable, Subject, Unsubscribable } from 'rxjs';
import { map, switchAll } from 'rxjs/operators';
import { HttpRequestStateStore } from '../HttpRequestStateStore';
import { HttpRequestState, HttpRequestStatus } from '../types';

export interface HttpRequestStateViewContext<T> {
  $implicit?: HttpRequestStateAny<T>;
  state?: HttpRequestStateAny<T>;
  status: {
    inProgress: boolean;
    notStarted: boolean;
    success: boolean;
    error: boolean;
  };
}

@Directive({
    selector: '[httpRequestState]',
    standalone: false
})
export class HttpRequestStateDirective<TParam extends any[], T> {

  readonly ViewContext: HttpRequestStateViewContext<T> = {
    $implicit: undefined,
    state: undefined,
    status: {
      inProgress: false,
      notStarted: true,
      success: false,
      error: false,
    }
  };


  subject = new Subject<Observable<HttpRequestState<T>>>();
  state = this.subject.pipe(switchAll(), defaultShareReplay());
  subscription: Unsubscribable;
  hooks: ((state: HttpRequestState<T>) => void)[] = [];

  @Input('httpRequestState') set stateStore(store: HttpRequestStateStore<TParam, T> | Observable<HttpRequestState<T>>) {
    if (isObservable(store)) {
      this.subject.next(store);
    } else {
      this.subject.next(store.state$.pipe(map(state => state.response)));
    }

  }
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {
    this.viewContainer.createEmbeddedView(this.templateRef, this.ViewContext);
    this.subscription = this.state.subscribe(state => {
      this.ViewContext.$implicit = state;
      this.ViewContext.state = state;
      this.ViewContext.status.inProgress = state.status === HttpRequestStatus.inProgress;
      this.ViewContext.status.notStarted = state.status === HttpRequestStatus.notStarted;
      this.ViewContext.status.success = state.status === HttpRequestStatus.success;
      this.ViewContext.status.error = state.status === HttpRequestStatus.fail;
      this.hooks.forEach(hook => hook(state));
    });
  }


  ngOnDestroy() {
    this.viewContainer.clear();
    this.subscription.unsubscribe();
  }

  static ngTemplateContextGuard<T>(dir: HttpRequestStateDirective<any, T>, ctx: any): ctx is HttpRequestStateViewContext<T> {
    return true;
  }

}

export type HttpRequestStateAny<T> = {
  status: HttpRequestStatus;
  body?: T;
  error?: any;
}
