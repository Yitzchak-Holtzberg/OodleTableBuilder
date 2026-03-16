import { Component, TemplateRef, ViewChild } from "@angular/core";

@Component({
    templateUrl: './initialization-component.html',
    standalone: false
})
export class InitializationComponent {
  @ViewChild('link', {static: true}) linkTemplate! : TemplateRef<any>;
  @ViewChild('imageUrl', {static: true}) imageUrlTemplate! : TemplateRef<any>;
  @ViewChild('currency', {static: true}) currencyTemplate! : TemplateRef<any>;
  @ViewChild('array', {static: true}) arrayTemplate! : TemplateRef<any>;
  @ViewChild('default', {static: true}) defaultTemplate! : TemplateRef<any>;
  @ViewChild('defaultWithIcon', {static: true}) defaultWithIcon! : TemplateRef<any>;
}
