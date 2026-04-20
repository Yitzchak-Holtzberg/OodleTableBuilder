import { Pipe, PipeTransform } from '@angular/core';
import { splitCommaValue } from '../functions/split-comma-value';

@Pipe({
    name: 'asFilterPills',
    standalone: false
})
export class AsFilterPillsPipe implements PipeTransform {
  transform(value: any): string[] | null {
    if (Array.isArray(value)) {
      return value.length > 1 ? value : null;
    }
    const split = splitCommaValue(value);
    return Array.isArray(split) && split.length > 1 ? split : null;
  }
}
