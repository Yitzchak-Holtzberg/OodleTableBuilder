import { Pipe, PipeTransform } from '@angular/core';
import { MetaData } from '../interfaces/report-def';
import {sumBy} from 'lodash';

@Pipe({
    name: 'columnTotal',
    standalone: false
})
export class ColumnTotalPipe implements PipeTransform {
  transform(data: any[], metaData: MetaData) {
    const dataToCalculate = data.filter(d => !d.isGroupHeader && !d.isGroupFooter)
    switch (metaData.additional!.footer!.type) {
      case 'sum':
      return sumBy(dataToCalculate, metaData.key);
    }
    return null;
  }
}
