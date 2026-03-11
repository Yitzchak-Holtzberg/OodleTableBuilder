import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HttpRequestModule } from '../http-state-module';
import { HttpRequestStateStore } from '../HttpRequestStateStore';
import { Subject } from 'rxjs';
import { RequestStateOptions } from '../types';


@Component({
    template: `
    <div *httpRequestState='requestState;let state;'>
        <ng-container *httpNotStartedState>not started</ng-container>
        <ng-container *httpInProgressState>in progress</ng-container>
        <ng-container *httpSuccessState='let body' >success {{body}}</ng-container>
        <ng-container *httpErrorState='let error' >error {{error}}</ng-container>
    </div>
    `,
    imports: [HttpRequestModule]
}) export class TestHttpRequestStateDirectiveComponent {
  constructor(public requestState: HttpRequestStateStore<any, any>) { }
}

export class MockHttpRequestState<T> extends HttpRequestStateStore<[], T> {
  subject = new Subject<T>();
  constructor(options?: RequestStateOptions) {
    super(()=> {
      return this.subject;
    }, options );
  }
}

let requestState: MockHttpRequestState<string>;
let fixture: ComponentFixture<TestHttpRequestStateDirectiveComponent>;

describe('Request State Directive', () => {

  beforeEach(() => {
    requestState = new MockHttpRequestState<string>();
    fixture = TestBed.configureTestingModule({
    providers: [{ provide: HttpRequestStateStore, useValue: requestState }],
    imports: [HttpRequestModule, TestHttpRequestStateDirectiveComponent]
}).createComponent(TestHttpRequestStateDirectiveComponent);
  });

  it('should begin with the state of not started', () => {
    verifyText('not started');
  });

  it('should be in progress while in progress', () => {
    requestState.request();
    verifyText('in progress');
  });

  it('should be success when success', () => {
    requestState.request();
    requestState.subject.next('yay')
    verifyText('success yay');
  });

  it('should be error when error', () => {
    requestState.request();
    requestState.subject.error('ouch');
    verifyText('error ouch');
  });

  function verifyText(text:string) {
    fixture.detectChanges();
    const node: HTMLElement = fixture.nativeElement;
    expect(node.innerText).toBe(text);
  }

});
