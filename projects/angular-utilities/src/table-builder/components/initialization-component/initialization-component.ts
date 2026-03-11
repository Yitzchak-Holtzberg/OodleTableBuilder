import { Component, TemplateRef, viewChild } from "@angular/core";
import { LinkColumnComponent } from "../link-column.component";
import { ArrayColumnComponent } from "../array-column.component";
import { MatIcon } from "@angular/material/icon";
import { FunctionPipe } from "../../../utilities/pipes/function.pipe";

@Component({
    templateUrl: './initialization-component.html',
    imports: [LinkColumnComponent, ArrayColumnComponent, MatIcon, FunctionPipe]
})
export class InitializationComponent {
  readonly linkTemplate = viewChild.required<TemplateRef<any>>('link');
  readonly imageUrlTemplate = viewChild.required<TemplateRef<any>>('imageUrl');
  readonly currencyTemplate = viewChild.required<TemplateRef<any>>('currency');
  readonly arrayTemplate = viewChild.required<TemplateRef<any>>('array');
  readonly defaultTemplate = viewChild.required<TemplateRef<any>>('default');
  readonly defaultWithIcon = viewChild.required<TemplateRef<any>>('defaultWithIcon');
}
