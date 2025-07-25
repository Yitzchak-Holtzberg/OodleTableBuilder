import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpRequestState } from '../types';
import { isSuccessState } from '../helpers';

export function tapSuccess<T>(onSuccess: (body: T) => void) {
  return function (src: Observable<HttpRequestState<T>>): Observable<HttpRequestState<T>> {
    return src.pipe(
        tap( result => {
            if(isSuccessState(result)) {
                onSuccess(result.body);
            }
        })
    );
  };
}
