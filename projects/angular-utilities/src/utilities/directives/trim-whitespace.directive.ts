import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({ selector: 'input[trimWhitespace]' })
export class TrimWhitespaceDirective {

  constructor(private elem: ElementRef) { }

  @HostListener('blur') onBlur() {
    const inputString = this.elem.nativeElement.value;
    if(inputString) {
      const newValue = inputString.trim().replace(/\t/g, '');
      if(inputString !== newValue) {
        this.elem.nativeElement.value = newValue;
        this.elem.nativeElement.dispatchEvent(new Event('input', {bubbles:true}));
      }
    }
  }
}