import { Component, TemplateRef, ViewChild } from "@angular/core";
import { LinkColumnComponent } from "../link-column.component";
import { ArrayColumnComponent } from "../array-column.component";
import { MatIcon } from "@angular/material/icon";
import { FunctionPipe } from "../../../utilities/pipes/function.pipe";

@Component({
    templateUrl: './initialization-component.html',
    imports: [LinkColumnComponent, ArrayColumnComponent, MatIcon, FunctionPipe]
})
export class InitializationComponent {
  @ViewChild('link', {static: true}) linkTemplate! : TemplateRef<any>;
  @ViewChild('imageUrl', {static: true}) imageUrlTemplate! : TemplateRef<any>;
  @ViewChild('currency', {static: true}) currencyTemplate! : TemplateRef<any>;
  @ViewChild('array', {static: true}) arrayTemplate! : TemplateRef<any>;
  @ViewChild('default', {static: true}) defaultTemplate! : TemplateRef<any>;
  @ViewChild('defaultWithIcon', {static: true}) defaultWithIcon! : TemplateRef<any>;
}
