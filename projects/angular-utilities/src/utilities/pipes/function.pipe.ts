import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'func' })
export class FunctionPipe implements PipeTransform {
  transform(func: ( (...args: any[])=> any ) | string, ...args: any[]): any {
    if(typeof func === 'string') {
      const [instance, ...tail] = args;
      const method = instance[func].bind(instance);
      return method(...tail);
    }
      return func(...args);
  }
}
