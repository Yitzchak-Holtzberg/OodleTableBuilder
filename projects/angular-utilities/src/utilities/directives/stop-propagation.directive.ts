import {Directive, HostListener} from "@angular/core";

@Directive({
    selector: "[stop-propagation]",
    standalone: false
})
export class StopPropagationDirective
{
    @HostListener("click", ["$event"])
    public onClick(event: any): void
    {
        event.stopPropagation();
    }

    @HostListener("mousedown", ["$event"])
    public onMousedown(event: any): void
    {
        event.stopPropagation();
    }
}
