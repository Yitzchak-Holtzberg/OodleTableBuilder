import { Directive, Input, ElementRef, inject } from '@angular/core';


@Directive({ selector: '[styler]' }) export class StylerDirective {
  private el = inject(ElementRef);

  @Input() set styler(styles){
    if(styles){
      Object.keys(styles).forEach( style => {
        this.el.nativeElement.style[style] = styles[style];
      });
    }
  };
}
