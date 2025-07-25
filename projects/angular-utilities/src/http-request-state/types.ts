import { Observable } from 'rxjs';
export enum HttpRequestStatus {
    notStarted,
    inProgress,
    success,
    fail,
    cancelled,
  }

  export type HttpRequestStateCancelled = {
    status: HttpRequestStatus.cancelled
  }

  export type HttpRequestStateNotStarted = {
    status: HttpRequestStatus.notStarted
  }

  export type HttpRequestStateInProgress = {
    status: HttpRequestStatus.inProgress
  }

  export type HttpRequestStateSuccess<T> = {
    status: HttpRequestStatus.success;
    body: T;
  }

  export type HttpRequestStateError = {
    status: HttpRequestStatus.fail;
    error: any;
  }


  export type HttpRequestState<T = any> =
    HttpRequestStateCancelled |
    HttpRequestStateNotStarted |
    HttpRequestStateInProgress |
    HttpRequestStateSuccess<T> |
    HttpRequestStateError ;

export enum HttpRequestStrategy {
  concurrent = 1,
  singleUse = 2,
  cancelPrevious = 3,
  sequential = 4,
}
export interface RequestStateOptions {
  strategy?: HttpRequestStrategy
}

export type HttpRequestFactory<TParam extends any[], T> = (...params: [...TParam]) => Observable<T>
