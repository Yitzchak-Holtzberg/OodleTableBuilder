import { isSuccessState } from '../helpers';
import { HttpRequestState } from '../types';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export const getRequestorBody = <T>(source: Observable<HttpRequestState<T>>) =>
  source.pipe(
    filter(isSuccessState),
    map( res => res.body)
  );