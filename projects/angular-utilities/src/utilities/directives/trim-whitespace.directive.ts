import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({ selector: 'input[trimWhitespace]' })
export class TrimWhitespaceDirective {
  private elem = inject(ElementRef);


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