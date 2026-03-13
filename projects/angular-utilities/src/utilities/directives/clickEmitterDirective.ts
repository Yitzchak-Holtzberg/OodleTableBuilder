import { Directive } from '@angular/core';
import { Subject } from 'rxjs';


@Directive({
    selector: '[clickEmitter]',
    exportAs: 'clickEmitter',
    host: {
        '(click)': 'next(true)'
    }
}) export class ClickEmitterDirective extends Subject<boolean> {
  constructor() {
    super();
  }
}
