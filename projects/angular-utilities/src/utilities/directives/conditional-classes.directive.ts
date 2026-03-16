import { Directive, ElementRef, Input, Renderer2, SimpleChanges } from '@angular/core';
import { Dictionary, Predicate } from '@ngrx/entity';

@Directive({
    selector: '[conditionalClasses]',
    standalone: false
})
export class ConditionalClassesDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

 @Input() element?: any;
 @Input('conditionalClasses') classes?: Dictionary<Predicate<any>>;

 classesApplied: string[] = [];

 ngOnChanges(changes: SimpleChanges) {
  let toApply: string [] = [];
  if(this.classes) {
    toApply = Object.keys(this.classes)
    .filter( key => this.classes![key]!(this.element) );
  }

  var classesNotYetApplied = toApply.filter( c => !this.classesApplied.includes(c) );
  var classesToRemove = this.classesApplied.filter( c => !toApply.includes(c));

  classesToRemove.forEach( c => this.renderer.removeClass( this.el.nativeElement, c ) );

  classesNotYetApplied.forEach( c => this.renderer.addClass( this.el.nativeElement , c ) );

  this.classesApplied = toApply;
 }


}
