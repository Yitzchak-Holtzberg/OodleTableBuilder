import { ChangeDetectionStrategy, Component, Input, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FilterInfo } from '../../classes/filter-info';
import { FieldType } from '../../interfaces/report-def';

@Component({
    selector: 'lib-in-filter',
    templateUrl: './in-filter.component.html',
    styleUrls: ['./in-filter.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: InFilterComponent,
            multi: true
        }],
    standalone: false
})
export class InFilterComponent implements ControlValueAccessor {
  FieldType = FieldType;
  @Input() type! : FieldType;
  value: any[] = [undefined];

  constructor(private ref: ChangeDetectorRef) {
    this.value = [undefined];
  }
  writeValue(obj: any[]): void {
    if(!obj?.length) obj  = [undefined];
    this.value = obj;
    this.ref.markForCheck();
  }
  onChange = (_: any) => { };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  onTouched = () => { };
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  addInput(){
    this.value = [...this.value, undefined];
    this.ref.markForCheck();
    this.onChange(this.value);
  }

  removeInput(index: number){
    this.value = [...this.value];
    this.value.splice(index,1);
    this.ref.markForCheck();
    this.onChange(this.value);
  }

  onValueChange(i:number,value: number | string){
    this.value = [...this.value];
    if (typeof value === 'string' && /[,\t\n\r]/.test(value)) {
      const parts = value.split(/[,\t\n\r]+/).map(s => s.trim());
      const leading = parts.slice(0, -1).filter(s => s);
      const last = parts[parts.length - 1];
      this.value.splice(i, 1, ...leading, last);
    } else {
      this.value[i] = value;
    }
    this.ref.markForCheck();
    this.onChange(this.value);
  }

}
