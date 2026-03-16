import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
    selector: '[autoFocus]',
    standalone: false
})
export class AutoFocusDirective implements AfterViewInit {

  @Input() autoFocus = true;
  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    if(this.autoFocus){
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      });
    }
  }

}
