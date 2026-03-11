import { Directive, ElementRef, AfterViewInit, input, inject } from '@angular/core';

@Directive({ selector: '[autoFocus]' })
export class AutoFocusDirective implements AfterViewInit {
  private elementRef = inject(ElementRef);


  readonly autoFocus = input(true);

  ngAfterViewInit() {
    if(this.autoFocus()){
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      });
    }
  }

}
