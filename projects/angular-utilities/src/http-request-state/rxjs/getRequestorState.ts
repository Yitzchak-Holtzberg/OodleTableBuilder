import { HttpRequestState } from '../types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const getRequestorStatus = <T>(source: Observable<HttpRequestState<T>>) =>
  source.pipe(
    map( res => res.status)
  );