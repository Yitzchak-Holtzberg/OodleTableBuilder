import { MockHttpRequestState } from "./directives/request-state-directive.spec";
import { createSuccess, inProgress, notStarted, createFailure } from "./helpers";

describe('HttpRequestStateStore', () => {

    it('should begin with the state of not started',  (done) =>  {
        const requestState = new MockHttpRequestState<string>();
        requestState.state$.subscribe( state => {
            expect(state).toEqual({ requestParams: null as any , response: notStarted});
            done();
        });
    });

    it('should be in progress when request is made',  (done) =>  {
        const requestState = new MockHttpRequestState<string>();
        requestState.request();
        requestState.state$.subscribe( state => {
            expect(state).toEqual({ requestParams: [], response: inProgress});
            done();
        });
    });

    it('should be in success when request completes successfully',  (done) =>  {
        const requestState = new MockHttpRequestState<string>();
        requestState.request();
        requestState.subject.next('hi');
        requestState.state$.subscribe( state => {
            expect(state).toEqual({ requestParams: [], response: createSuccess('hi')});
            done();
        });
    });

    it('should be in error when request errors',  (done) =>  {
        const requestState = new MockHttpRequestState<string>();
        requestState.request();
        requestState.subject.error('error');
        requestState.state$.subscribe( state => {
            expect(state).toEqual({ requestParams: [], response: createFailure('error') });
            done();
        });
    });

});
