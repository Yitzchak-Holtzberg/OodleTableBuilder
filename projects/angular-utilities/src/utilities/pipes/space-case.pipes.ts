import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'spaceCase',
    standalone: false
})
export class SpaceCasePipe implements PipeTransform {
  transform(value: string): string {
    return  spaceCase(value);
  }
}

/**
 * Adds a space before uppercase letters that either
 * 1. follows a lowercase letter or digit
 * 2. or precedes a lowercase letter and follows an alpha-numeric character
 * 
 * Uppercases the first digit
 * 
 * Turns underscores into spaces
 */
export function spaceCase(value: string){
  const phrase = value?.replace(/([a-z0-9])([A-Z])|([a-zA-Z0-9])([A-Z])(?=[a-z])|_/g, '$1$3 $2$4')
  // uppercase the first character of every word
  return phrase?.replace(/(^| )(\w)/g, x => x.toUpperCase());
}
