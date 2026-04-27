export type WildcardAnchor = 'none' | 'start' | 'end' | 'both';

export function hasWildcard(s: unknown): s is string {
  return typeof s === 'string' && /[*?]/.test(s);
}

export function wildcardToRegex(pattern: string, anchor: WildcardAnchor): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const prefix = anchor === 'start' || anchor === 'both' ? '^' : '';
  const suffix = anchor === 'end'   || anchor === 'both' ? '$' : '';
  return new RegExp(prefix + escaped + suffix, 'i');
}
