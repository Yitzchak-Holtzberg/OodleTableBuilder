import { Injectable, OnDestroy } from "@angular/core";
import { HttpRequestFactory, RequestStateOptions } from "./types";
import { HttpRequestStateStore } from './HttpRequestStateStore';
import { Observable } from "rxjs";

@Injectable()
export class HttpRequestStateFactory  implements OnDestroy {

  constructor() {}
  ngOnDestroy(): void {
    this.requestors.forEach( request => request.ngOnDestroy());
  }
  private requestors: OnDestroy[] = [];
  create<TParam extends any[], T>( req: HttpRequestFactory<TParam,T>, options?: RequestStateOptions ) : HttpRequestStateStore<TParam,T> {
    const requestor = new HttpRequestStateStore(req, options);
    this.requestors.push(requestor);
    return requestor;
  }

  createHttpClient<T>( r: (o: Observable<T> ) => Observable<T> , options?: RequestStateOptions )  {
    const requestor = new HttpRequestStateStore(r, options);
    this.requestors.push(requestor);
    return requestor;
  }

}