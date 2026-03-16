import { NgModule } from "@angular/core";
import { AutoFocusDirective } from "./directives/auto-focus.directive";
import { ClickEmitterDirective } from "./directives/clickEmitterDirective";
import { ClickSubjectDirective } from "./directives/clickSubject";
import { ConditionalClassesDirective } from "./directives/conditional-classes.directive";
import { DialogDirective } from "./directives/dialog";
import { DialogService } from "./directives/dialog-service";
import { MatSlideToggleGroupDirective } from "./directives/mat-toggle-group-directive";
import { PreventEnterDirective } from "./directives/prevent-enter.directive";
import { StopPropagationDirective } from "./directives/stop-propagation.directive";
import { TrimWhitespaceDirective } from "./directives/trim-whitespace.directive";
import { StylerDirective } from "./directives/styler";
import { FunctionPipe } from "./pipes/function.pipe";
import { PhoneNumberPipe } from "./pipes/phone.pipe";
import { SpaceCasePipe } from "./pipes/space-case.pipes";

@NgModule({
  imports: [

  ],
    exports: [
        StopPropagationDirective,
        PreventEnterDirective,
        SpaceCasePipe,
        PhoneNumberPipe,
        FunctionPipe,
        StopPropagationDirective,
        TrimWhitespaceDirective,
        StylerDirective,
        PreventEnterDirective,
        AutoFocusDirective,
        ClickSubjectDirective,
        ClickEmitterDirective,
        DialogDirective,
        MatSlideToggleGroupDirective,
        ConditionalClassesDirective,
    ],
    declarations: [
        SpaceCasePipe,
        PhoneNumberPipe,
        FunctionPipe,
        StopPropagationDirective,
        StylerDirective,
        PreventEnterDirective,
        AutoFocusDirective,
        TrimWhitespaceDirective,
        ClickSubjectDirective,
        ClickEmitterDirective,
        DialogDirective,
        MatSlideToggleGroupDirective,
        ConditionalClassesDirective,
    ],
    providers : [
      DialogService
    ]
})
export class UtilitiesModule {
}
