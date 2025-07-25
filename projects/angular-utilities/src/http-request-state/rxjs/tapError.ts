import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpRequestState } from '../types';
import { isErrorState } from '../helpers';

export function tapError(onError: (error: any) => void) {
  return function (src: Observable<HttpRequestState>): Observable<HttpRequestState> {
    return src.pipe(
        tap( result => {
            if(isErrorState(result)) {
                onError(result.error);
            }
        })
    );
  };
}
