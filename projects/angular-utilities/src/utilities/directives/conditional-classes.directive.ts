import { Directive, ElementRef, Renderer2, SimpleChanges, input, inject } from '@angular/core';
import { Dictionary, Predicate } from '@ngrx/entity';

@Directive({ selector: '[conditionalClasses]' })
export class ConditionalClassesDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);


 readonly element = input<any>();
 readonly classes = input<Dictionary<Predicate<any>>>(undefined, { alias: "conditionalClasses" });

 classesApplied: string[] = [];

 ngOnChanges(changes: SimpleChanges) {
  let toApply: string [] = [];
  const classes = this.classes();
  if(classes) {
    toApply = Object.keys(classes)
    .filter( key => this.classes()![key]!(this.element()) );
  }

  var classesNotYetApplied = toApply.filter( c => !this.classesApplied.includes(c) );
  var classesToRemove = this.classesApplied.filter( c => !toApply.includes(c));

  classesToRemove.forEach( c => this.renderer.removeClass( this.el.nativeElement, c ) );

  classesNotYetApplied.forEach( c => this.renderer.addClass( this.el.nativeElement , c ) );

  this.classesApplied = toApply;
 }


}
