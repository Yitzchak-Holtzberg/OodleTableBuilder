import { map, startWith, switchMap } from 'rxjs/operators';
import { getRequestorBody } from './rxjs/getRequestorBody';
import { getRequestorStatus } from './rxjs/getRequestorState';
import { mapError } from '../rxjs/mapError';
import { defaultShareReplay } from '../rxjs/defaultShareReplay';
import { Observable, of, ReplaySubject } from 'rxjs';
import { HttpRequestFactory, HttpRequestState, HttpRequestStatus } from './types';
import { createFailure, createSuccess, inProgress, notStarted } from './helpers';

export type HttpRequestState$ <T> = Observable<HttpRequestState<T>>;

export interface HttpRequestor <Res, Req> {
  httpState$: Observable<HttpRequestState<Res>>;
  status$: Observable<HttpRequestStatus>;
  body$: Observable<Res>;
  request: Req;
}

export function httpRequest<T = any>(req: Observable<T>): HttpRequestState$<T> {
  return req.pipe(
    map(createSuccess),
    mapError(createFailure),
    startWith(inProgress),
    defaultShareReplay()
  );
}

export function httpRequestor<TParam extends any[], T>(req: HttpRequestFactory<TParam,T> ): HttpRequestor<T, (...params: [...TParam]) => Observable<HttpRequestState<T>>> {
  const request$ = new ReplaySubject<[...TParam]>(1);
  const httpState$ : HttpRequestState$<T> = request$.pipe(
    switchMap( (params) => httpRequest<T>(req(...params)) ),
    startWith(notStarted),
    defaultShareReplay(),
  );
  const request = (...params: [...TParam]) => {
    request$.next(params);
    return httpState$;
  };
  return ({
    request,
    httpState$,
    body$: httpState$.pipe(getRequestorBody),
    status$: httpState$.pipe(getRequestorStatus)
  });
}

export function chainRequest<TParam extends any[], T, TT>(
  httpState$: Observable<HttpRequestState<T>>,
  request:HttpRequestFactory<TParam,TT>,
  requestParams: ((responseFromPrevious: T) => [...TParam]) | (() => [...TParam])
  ): Observable<HttpRequestState<TT>> {
  return httpState$.pipe(
    switchMap( res => {
      if(res.status === HttpRequestStatus.success) {
        const secondReq = httpRequestor<[...TParam], TT>(request);
        const param = requestParams(res.body);
        secondReq.request(...param );
        return secondReq.httpState$;
      } else {
        return of(res);
      }
    }),
  );
}





