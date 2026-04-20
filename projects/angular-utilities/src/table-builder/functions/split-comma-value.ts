export function splitCommaValue<T>(value: T): T | string[] {
  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map(s => s.trim()).filter(s => s);
  }
  return value;
}
