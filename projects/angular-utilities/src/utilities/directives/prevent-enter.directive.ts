import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: 'preventEnter',
    standalone: false
})
export class PreventEnterDirective {

  @HostListener('keydown.enter', ['$event'])
  onKeyDown() {
      return false
  }
}
