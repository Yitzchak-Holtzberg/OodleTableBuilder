// Splits on comma, tab, newline, or carriage return (consecutive delimiters collapse).
// Plain space is deliberately excluded: legitimate filter values often contain spaces
// (company names, addresses, descriptions) and a user can't accidentally type tab or
// newline into a single-line input — so these are unambiguous "I copy-pasted multiple
// values" signals.
const DELIMITERS = /[,\t\n\r]+/;

export function splitCommaValue<T>(value: T): T | string[] {
  if (typeof value === 'string' && DELIMITERS.test(value)) {
    return value.split(DELIMITERS).map(s => s.trim()).filter(s => s);
  }
  return value;
}
