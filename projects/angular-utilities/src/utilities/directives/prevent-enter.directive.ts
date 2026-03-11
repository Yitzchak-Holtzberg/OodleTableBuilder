import { Directive, HostListener } from '@angular/core';

@Directive({ selector: 'preventEnter' })
export class PreventEnterDirective {

  @HostListener('keydown.enter')
  onKeyDown() {
      return false
  }
}
