import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export function defaultShareReplay<T>() {
  return function (src: Observable<T>): Observable<T> {
    return src.pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  };
}