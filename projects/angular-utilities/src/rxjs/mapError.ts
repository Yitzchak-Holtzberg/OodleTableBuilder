import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function mapError<T, TResult>(projection: (error: any) => TResult) {
  return function (src: Observable<T>): Observable<T | TResult> {
    return src.pipe(catchError(e => of(projection(e))),);
  };
}