import { Directive, Input, Optional, Predicate, SimpleChanges } from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject, Subject, takeUntil, tap } from "rxjs";
import { CustomFilter, FilterInfo } from "../classes/filter-info";
import { v4 as uuid } from 'uuid';
import { FilterType } from "../enums/filterTypes";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatRadioButton } from "@angular/material/radio";
import { MatButtonToggle } from '@angular/material/button-toggle';
import { MatCheckbox } from "@angular/material/checkbox";
import { FieldType } from "../interfaces/report-def";
import { NgControl } from "@angular/forms";
import { ComponentStore } from "@ngrx/component-store";
import { TableWrapperDirective } from "./table-wrapper.directive";
import { MatOption } from "@angular/material/core";


const inputs = [
  'predicate: tbCustomFilter',
  'filterId: filterId',
];


@Directive({
    selector: ' ',
    standalone: false
})
export abstract class TableCustomFilterDirective<T = any> {
  abstract filter$ : Observable<CustomFilter>;
  filterId!: string;
  savable = false;
  used = false;
  abstract active: boolean;
  abstract reset(): void;
}




@Directive({
    selector: "[tbFilter]",
    standalone: false
}) export class TableFilterDirective extends ComponentStore<FilterInfo> {

  constructor(@Optional() protected  model: NgControl, @Optional() wrapper: TableWrapperDirective) {
    super();
    if(wrapper) {
      wrapper.register(this);
    }
    if(model) {
      this.effect( () => {
        return model.valueChanges!.pipe(
          tap( val => {
            this.filterValue = val;
            this.update();
          })
        )
      })
    }
  }
  reset() {
    this.filterValue = undefined;
  }
  filter$ = this.state$;

  @Input() filterType!: FilterType;
  @Input() key!: string;
  @Input() fieldType!: FieldType;
  @Input() filterId!: string;
  @Input() active = true;
  @Input() filterValue: any = null;

  setFilterValue(value: any) {
    if(this.model) {
      setTimeout(() => {
        this.model.reset(value);
      }, 0);
    } else {
      this.filterValue = value;
    }
  }


  used = false;
  savable = false;
  ready = false;

  _userActive = true;
  ngOnChanges(changes: SimpleChanges ) {
    this.update();
  }

  ngOnInit() {
    if(!this.filterId) {
      this.filterId = uuid();
    } else {
      this.savable = true;
    }
    this.ready = true;
    this.update();
  }

  protected setFilter(filter: FilterInfo ) {
    this.setState(filter);
  }

  update() {
    if (this.ready) {
      this.setFilter(
        {
          filterId: this.filterId,
          key: this.key,
          filterType: this.filterType,
          fieldType: this.fieldType,
          filterValue: this.filterValue,
          active: this.active && this.filterValue !== undefined,
          _isExternalyManaged: true,
        }
      );

    }
  }
}

@Directive({
    selector: '[tbFilterStringContains]',
    providers: [{ provide: TableFilterDirective, useExisting: TableFilterStringContainsDirective }],
    inputs: [
        'key:tbFilterStringContains',
        'filterValue:filterValue',
        'filterId: filterId',
        'active: active',
    ],
    standalone: false
}) export class TableFilterStringContainsDirective extends TableFilterDirective {
  constructor(@Optional()  model: NgControl, @Optional() wrapper: TableWrapperDirective) {
    super(model,wrapper);
    this.filterType = FilterType.StringContains;
    this.fieldType = FieldType.String;
  }

  override reset() {
    if(this.model) {
      this.model.reset();
    }
    super.reset();
  }

  override setFilter(filter: FilterInfo) {
    filter.active = filter.filterValue && this._userActive;
    super.setFilter(filter);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['active']) {
      this._userActive = changes['active'].currentValue;
    }
    super.ngOnChanges(changes);
  }
}

@Directive({
    selector: "[tbCustomFilter]",
    standalone: false
})
export abstract class TableCustomFilterDirectiveBase<T = any> extends TableCustomFilterDirective<T> {

  filter$! : Subject<CustomFilter>;
  filter!: CustomFilter;
  @Input() filterId! : string;

  _predicate!: Predicate<T>;
  @Input('tbCustomFilter') set predicate( val: Predicate<T> ) {
    this._predicate = val;
    this.update({predicate:val});
  }

  _active: boolean = false;
  ready = false;

  update(val: Partial<CustomFilter> ) {
    if(this.ready) {
      this.filter = {...this.filter,...val};
      this.filter$.next(this.filter);
    }
  }

  @Input() set active(val: boolean) {
    if(this._active !== val) {
      this._active = val;
      this.update({active:val});
    }
  }
  get active(): boolean {
    return this._active;
  }

  ngOnInit() {
    if(!this.filterId) {
      this.filterId = uuid();
    } else {
      this.savable = true;
    }

    this.filter = {
      filterType: FilterType.Custom,
      filterId: this.filterId,
      active: this._active,
      predicate: this._predicate,
    };
    this.ready = true;
    this.filter$ = new BehaviorSubject(this.filter);
  }
}

@Directive()
export abstract class TbSelectedFilterDirective<T = any>  extends TableCustomFilterDirectiveBase<T> {


  protected constructor(private change: Observable<any>, private isActive: () => boolean, @Optional() wrapper: TableWrapperDirective) {
    super();
    if(wrapper) {
      wrapper.register(this);
    }
  }

  reset() {
    this.active = false;
  }

  destroySubject$ = new ReplaySubject<void>(1);
  ngOnDestroy() {
    this.destroySubject$.next();
  }

  ngOnInit(): void {
    this._active = this.isActive();
    super.ngOnInit();
    this.change.pipe(takeUntil(this.destroySubject$)).subscribe( () => {
      this.active = this.isActive();
    });
  }
}

// Checkbox
@Directive({
    selector: 'mat-checkbox[tbCustomFilter]',
    inputs: [
        ...inputs
    ],
    providers: [{ provide: TableCustomFilterDirective, useExisting: MatCheckboxTbFilterDirective }],
    standalone: false
})
export class MatCheckboxTbFilterDirective extends TbSelectedFilterDirective {

  override set active(val: boolean) {
    this.matCheckbox.checked = val;
    super.active = val;
  }
  constructor(private matCheckbox: MatCheckbox, @Optional() wrapper: TableWrapperDirective) {
    super(matCheckbox.change, () => matCheckbox.checked, wrapper);
  }
}


@Directive({
    selector: 'mat-slide-toggle[tbCustomFilter]',
    inputs: [
        ...inputs
    ],
    providers: [{ provide: TableCustomFilterDirective, useExisting: MatSlideToggleTbFilterDirective }],
    standalone: false
})
export class MatSlideToggleTbFilterDirective<T = any> extends TbSelectedFilterDirective<T> {
  override set active(val: boolean) {
    this.matSlideToggle.checked = val;
    super.active = val;
  }
  constructor(private matSlideToggle: MatSlideToggle, @Optional() wrapper: TableWrapperDirective) {
    super(matSlideToggle.change, () => matSlideToggle.checked,wrapper);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}

// Radio button
@Directive({
    selector: 'mat-radio-button[tbCustomFilter]',
    inputs: ['predicate: tbCustomFilter'],
    providers: [{ provide: TableCustomFilterDirective, useExisting: MatRadioButtonTbFilterDirective }],
    standalone: false
})
export class MatRadioButtonTbFilterDirective extends TbSelectedFilterDirective {

  override set active(val: boolean) {
    this.matRadioButton.checked = val;
    super.active = val;
  }
  constructor(private matRadioButton: MatRadioButton, @Optional() wrapper: TableWrapperDirective) {
    super(matRadioButton.change, () => matRadioButton.checked, wrapper);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}

// Option (select)
@Directive({
    selector: 'mat-option[tbCustomFilter]',
    inputs: [
        ...inputs
    ],
    providers: [{ provide: TableCustomFilterDirective, useExisting: MatOptionTbFilterDirective }],
    standalone: false
})
export class MatOptionTbFilterDirective extends TbSelectedFilterDirective {

  override set active(val: boolean) {
    if(val) {
      this.matOption.select();
    } else {
      this.matOption.deselect();
    }
    super.active = val;
  }
  constructor(private matOption: MatOption, @Optional() wrapper: TableWrapperDirective) {
    super( matOption.onSelectionChange.pipe(tap( d => {
      if(!matOption.value) {
        matOption.value = uuid();
      }
    }

    )), () => matOption.selected, wrapper);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}

// Button toggle
@Directive({
    selector: 'mat-button-toggle[tbCustomFilter]',
    inputs: [
        ...inputs
    ],
    providers: [{ provide: TableCustomFilterDirective, useExisting: MatButtonToggleFilterDirective }],
    standalone: false
})
export class MatButtonToggleFilterDirective extends TbSelectedFilterDirective {
  override set active(val: boolean) {
    this.matButtonToggle.checked = val;
    super.active = val;
  }
  constructor(private matButtonToggle: MatButtonToggle, @Optional() wrapper: TableWrapperDirective) {
    super(matButtonToggle.change, () => matButtonToggle.checked,wrapper);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
