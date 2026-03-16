import { ContentChildren, Directive, Input, Output, QueryList } from "@angular/core";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { merge, Observable, ReplaySubject, scan, startWith, switchMap } from "rxjs";


@Directive({ selector: '[opMatSlideToggleGroup]' }) export class MatSlideToggleGroupDirective  {
  @Input() allowMultiple = false;

  _toggles!: QueryList<MatSlideToggle>;
  @ContentChildren(MatSlideToggle) set toggles(val: QueryList<MatSlideToggle>) {
    this._toggles = val;
    this._ready.next(true);
  }

  private _ready = new ReplaySubject<boolean>(1);

  @Output() get valueEmitter() : Observable<{[key:string]: boolean}> {
    return this._ready.pipe( switchMap( _ => this.getObs()));
  }


  getInitValue() {
    const startValue = this._toggles.reduce( (prev,cur) => {
      if(!cur.name) {
        throw new Error('toggle must have the name attribute set');
      }
      prev[cur.name] = cur.checked
      return prev;
    }, {} as {[k:string]: boolean});
    return startValue;
  }

  getObs() {
    var toggleChanges = merge(...this._toggles.map( toggle => toggle.change ));

    const startValue = this.getInitValue();

    return toggleChanges.pipe(
      scan( (prev,cur) => {
        const toggleName = cur.source.name!;
        const newVal = {...prev,[toggleName]:cur.checked};
        if(cur.checked && !this.allowMultiple) {
          Object.keys(prev)
            .filter( key => key !== toggleName && prev[key])
            .forEach( key => {
              newVal[key] = false;
              this._toggles.find( toggle => toggle.name === key)!.toggle();
            });
        }
        return newVal;
      },startValue),
      startWith(startValue),
    );

  }

}
