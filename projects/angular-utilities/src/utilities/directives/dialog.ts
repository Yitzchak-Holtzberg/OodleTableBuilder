import { Directive, TemplateRef, Input, OnDestroy, Component, ViewContainerRef, Injector, ComponentFactoryResolver, input, output } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subscription, Subject } from 'rxjs';
import { switchAll } from 'rxjs/operators';
import { DialogService } from './dialog-service';


interface DialogViewContext<T> {
  $implicit: T,
  opDialog: T,
  close: () => void,

}

@Component({
    selector: 'app-dialog-content',
    template: ``,
    standalone: false
})
export class DialogWrapper<T = any> {
  viewEmbeded = false;
  viewContext = {
    close: () => {},
  } as DialogViewContext<T>;
  set template(tmpl: TemplateRef<DialogViewContext<T>>) {
    if (this.viewEmbeded) {
      this.vcr.clear();
    }
    this.viewEmbeded = true;
    this.vcr.createEmbeddedView(tmpl, this.viewContext);
  }

  set close(closeMethod: () => void ) {
    this.viewContext.close = closeMethod;
  }

  set data(value: T) {
    this.viewContext.$implicit = value;
    this.viewContext.opDialog = value;
  }
  constructor(private vcr: ViewContainerRef ) {
  }

}


const defaultDialogConfig: MatDialogConfig = {
  maxHeight: '95vh',
}


@Directive({ selector: '[opDialog]' }) export class DialogDirective<T> implements OnDestroy {
  readonly opDialogClosed = output<boolean>();
  _dialogConfig: MatDialogConfig<T> = defaultDialogConfig;
  readonly add_opDialog_Class = input(true);
  @Input() set opDialogConfig(config: MatDialogConfig<T>) {
    
    this._dialogConfig = { ...defaultDialogConfig, ...config };
  }

  get opDialogConfig() : MatDialogConfig<T> {
    return this._dialogConfig;
  }
  @Input('opDialog') set state(open_close: Observable<T>) {
    this._data.next(open_close);
  }
  readonly nativeElement = input<HTMLElement>(undefined, { alias: "opDialogOrigin" });
  dialogRef?: MatDialogRef<any, boolean>;
  subscription: Subscription;
  componentWrapper?: DialogWrapper<T>;

  constructor(
    private templateRef: TemplateRef<DialogViewContext<T>>,
    private dialog: MatDialog,
    private service: DialogService) {
    this.subscription = this._data.pipe(
      switchAll()
    ).subscribe(d => {
      if (d) {
        this.opDialogConfig.data = d;
        this.setDialogState(true);
      } else {
        this.setDialogState(false);
      }
    });
  }

  _data = new Subject<Observable<T>>();

  close() {
    this.dialogRef?.close();
  }

  initDialog() {
    const nativeElement = this.nativeElement();
    if(nativeElement){
      const rect = nativeElement.getBoundingClientRect();
      const position = { left: `${rect.left}px`, top: `${rect.bottom - 50}px` };
      this.opDialogConfig = {...this.opDialogConfig , position};
    }
    if (this.add_opDialog_Class()) {
      this.opDialogConfig.panelClass = [...(Array.isArray(this.opDialogConfig.panelClass) ? this.opDialogConfig.panelClass : this.opDialogConfig.panelClass ? [this.opDialogConfig.panelClass] : []), 'opDialog'];
    }
    this.dialogRef = this.dialog.open(DialogWrapper, this.opDialogConfig);
    this.componentWrapper = this.dialogRef.componentInstance;
    this.componentWrapper!.close = () => this.dialogRef?.close();
    this.componentWrapper!.data = this.opDialogConfig.data as T;
    this.componentWrapper!.template = this.templateRef;
    if (!this.opDialogConfig.disableClose) {
      this.service.addDialogRef(this.dialogRef);
    }
    const sub = this.dialogRef.afterClosed().subscribe(() => {
      this.opDialogClosed.emit(true);
      this.service.removeDialogRef(this.dialogRef!);
      this.dialogRef = undefined;
      sub.unsubscribe();
    });
  }

  setDialogState(open: boolean) {
    if (open) {
      if (!this.dialogRef) {
        this.initDialog();
      } else {
        this.componentWrapper!.data = this.opDialogConfig.data as T;
      }
    } else if (!open && this.dialogRef) {
      this.dialogRef.close();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

 static ngTemplateContextGuard<T>(dir: DialogDirective<T>, ctx: any): ctx is DialogViewContext<Exclude<T, false|0|''|null|undefined>> {
   return true;
 }

}
