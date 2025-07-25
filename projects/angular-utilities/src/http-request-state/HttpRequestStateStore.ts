import { Observable, of, Subscription } from 'rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { HttpRequestFactory, HttpRequestStrategy, HttpRequestStatus, HttpRequestState, RequestStateOptions, HttpRequestStateCancelled } from './types';
import { createFailure, createSuccess, inProgress, isErrorState, isSuccessOrErrorState, isSuccessState, notStarted } from './helpers';
import { concatMap, filter, map, mergeMap, pluck, startWith, switchMap, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { mapError } from '../rxjs/mapError';
import { defaultShareReplay } from '../rxjs/defaultShareReplay';
import { Directive } from '@angular/core';

export interface RequestResponse<TParam extends any[],T> {
  requestParams: [...TParam];
  response: HttpRequestState<T>;
}

@Directive()
export class HttpRequestStateStore<TParam extends any[], T> extends ComponentStore<RequestResponse<TParam,T>> {

    constructor(private req: HttpRequestFactory<TParam,T> ,private options?: RequestStateOptions) {
      super({ requestParams: null as any ,response: notStarted });
      this.request = (this.options?.strategy === HttpRequestStrategy.singleUse) ? this.singleUseRequest :  this.flattenedRequest;
    }

    reset() {
      this.setState({ requestParams:null as any, response: notStarted });
    }

    private flatteningStrategy = () => {
      if(this.options?.strategy === HttpRequestStrategy.concurrent)
        return mergeMap( (params: [...TParam]) => this.createRequest(...params));
      if(this.options?.strategy === HttpRequestStrategy.sequential)
        return concatMap( (params: [...TParam]) => this.createRequest(...params));
      return switchMap( (params: [...TParam]) => ((params[0] as any) instanceof CancellationToken) ?
        of({ requestParams: params[0], response: { status: HttpRequestStatus.cancelled } as HttpRequestStateCancelled } ) : this.createRequest(...params) );
    }

    private requestEffect: (value: [...TParam] ) => Subscription = this.effect((obs: Observable<[...TParam]>) => {
      return (obs).pipe(
        this.flatteningStrategy(),
        tap<RequestResponse<TParam, T>>(state => this.setState(state)),
      );
    });

    private flattenedRequest = (...value: [...TParam]) => {
      return this.requestEffect(value) as Subscription;
    }
    private singleUseRequest = (...value: [...TParam]) => {
      if (this.get().response.status !== HttpRequestStatus.notStarted) {
        throw new Error("state can not be reused. either reset the state by calling reset() or use a state requester that allows concurrent requests.");
      }
      return this.requestEffect(value) as Subscription;
    }

    selectHttpState$ = this.state$.pipe(map(a => a.response));

    selectStatus$ = this.selectHttpState$.pipe(map(a => a.status));

    selectError$ = this.state$.pipe(
      map(r => r.response),
      filter(isErrorState),
      map( state => state.error)
    );

    selectResponse$ = this.state$.pipe(
      map(r => r.response),
      filter(isSuccessState),
      map( state => state.body)
    );
    selectSuccessOrError$ = this.state$.pipe(
      map(r => r.response),
      filter(isSuccessOrErrorState),
      map( () => null)
    );

    errorHandled = false;
    onError( cb: (error: HttpErrorResponse) => void) {
      this.errorHandled = true;
      this.on(this.selectError$, cb);
      return this;
    }

    onSuccess( cb: (body: T) => void) {
      this.on(this.selectResponse$, cb);
      return this;
    }

    onSuccessOrError(cb: () => void){
      this.on(this.selectSuccessOrError$, cb);
      return this;
    }

    onSuccessWithRequest(func: (state: {
      requestParams: [...TParam];
      body: T;
    }) => void) {
      this.onUpdate(({ requestParams, response }) => {
        if(isSuccessState(response)){
          func({requestParams,body: response.body});
        }
      });
      return this;
    }

    onErrorWithRequest(func: (state: {
      error: HttpErrorResponse;
      requestParams: [...TParam];
    }) => void) {
      this.onUpdate( ({ requestParams, response }) => {
        if(isErrorState(response)){
          func({ requestParams, error: response.error });
        }
      });
      return this;
    }

    private createRequest(...params: [...TParam]): Observable<RequestResponse<TParam,T>> {
      return this.req(...params).pipe(
        map(createSuccess),
        mapError(createFailure),
        startWith(inProgress),
        map( state => ({ requestParams: params, response: state })),
        defaultShareReplay()
      );
    }

    onUpdate(func: (state: {
      requestParams: [...TParam];
      response: HttpRequestState<T>;
    }) => void) {
      this.on(this.state$, func);
    }

    on = <V>(srcObservable: Observable<V>, func: (obj: V) => void): Subscription => {
      return this.effect((src: Observable<V>) => {
        return src.pipe(tap(func));
      })(srcObservable) as Subscription;
    }

    request: (...value: [...TParam] ) => Subscription;

    ngOnDestroy() {
      super.ngOnDestroy();
    }

  }

  export class CancellationToken {}
