import { Directive, Input } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
    selector: '[clickSubject]',
    exportAs: 'clickSubject',
    host: {
        '(click)': 'next(this._val)'
    }
}) export class ClickSubjectDirective<T = boolean> extends Subject<T> {
  constructor( ) {
    super();
  }
  _val!: T;

  @Input('clickSubject') set clickSubject( val: T) {
    this._val = val;
  }
}
