import { toArray } from "rxjs/operators";
import { MockHttpRequestState } from "./directives/request-state-directive.spec";
import { HttpRequestStrategy } from "./types";

describe('HttpRequestStateStore', () => {

    it('should throw when strategy is use once and it was reused',  () =>  {
        const requestState = new MockHttpRequestState<string>({strategy: HttpRequestStrategy.singleUse});
        requestState.request();
        expect( ()=>{
            requestState.request();
        } ).toThrow();
    });

    
    it('should emit both when strategy is concurrent',  (done) =>  {
        const requestState = new MockHttpRequestState<string>({strategy: HttpRequestStrategy.concurrent});
        requestState.request();
        requestState.request();
        requestState.selectResponse$.pipe( toArray()
        ).subscribe( d => {
            expect(d.length).toBe(2);
            done();
        });
        requestState.subject.next('hi');
        requestState.ngOnDestroy();
    });

    it('should emit only one when strategy is cancel previous',  (done) =>  {
        const requestState = new MockHttpRequestState<string>({strategy: HttpRequestStrategy.cancelPrevious});
        requestState.request();
        requestState.request();
        requestState.selectResponse$.pipe( toArray()
        ).subscribe( d => {
            expect(d.length).toBe(1);
            done();
        });
        requestState.subject.next('hi');
        requestState.ngOnDestroy();

    });
});
