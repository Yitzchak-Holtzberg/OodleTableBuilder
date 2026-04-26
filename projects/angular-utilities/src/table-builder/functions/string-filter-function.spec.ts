import { StringFilterFuncs } from './string-filter-function';
import { FilterType } from '../enums/filterTypes';
import { FilterInfo } from '../classes/filter-info';

const makeInfo = (filterValue: any): FilterInfo => ({
  filterId: 'test',
  key: 'k',
  filterType: FilterType.StringContains,
  filterValue,
} as FilterInfo);

describe('StringFilterFuncs', () => {

  describe('StringContains', () => {
    const fn = StringFilterFuncs[FilterType.StringContains];

    it('matches a single substring', () => {
      const predicate = fn(makeInfo('foo'));
      expect(predicate('hello foo bar')).toBe(true);
      expect(predicate('nothing')).toBe(false);
    });

    it('is case-insensitive', () => {
      const predicate = fn(makeInfo('FOO'));
      expect(predicate('hello foo bar')).toBe(true);
    });

    it('OR-matches a comma-separated string', () => {
      const predicate = fn(makeInfo('foo,bar'));
      expect(predicate('contains foo')).toBe(true);
      expect(predicate('contains bar')).toBe(true);
      expect(predicate('contains baz')).toBe(false);
    });

    it('trims whitespace around comma-separated values', () => {
      const predicate = fn(makeInfo('  foo  ,  bar  '));
      expect(predicate('contains foo')).toBe(true);
      expect(predicate('contains bar')).toBe(true);
    });

    it('does not split on plain space (multi-word values stay intact)', () => {
      const predicate = fn(makeInfo('ACME INC'));
      expect(predicate('ACME INC — corporate')).toBe(true);
      expect(predicate('ACME')).toBe(false); // "INC" must be present too
    });

    it('OR-matches a tab-separated string (Excel row paste)', () => {
      const predicate = fn(makeInfo('foo\tbar\tbaz'));
      expect(predicate('has foo')).toBe(true);
      expect(predicate('has bar')).toBe(true);
      expect(predicate('has baz')).toBe(true);
      expect(predicate('has qux')).toBe(false);
    });

    it('OR-matches a newline-separated string (Excel column paste, after directive injection)', () => {
      const predicate = fn(makeInfo('foo\nbar\nbaz'));
      expect(predicate('has foo')).toBe(true);
      expect(predicate('has bar')).toBe(true);
      expect(predicate('has baz')).toBe(true);
    });

    it('handles CRLF line endings', () => {
      const predicate = fn(makeInfo('foo\r\nbar'));
      expect(predicate('has foo')).toBe(true);
      expect(predicate('has bar')).toBe(true);
    });

    it('OR-matches mixed comma and tab/newline delimiters', () => {
      const predicate = fn(makeInfo('foo,bar\tbaz\nqux'));
      expect(predicate('has foo')).toBe(true);
      expect(predicate('has bar')).toBe(true);
      expect(predicate('has baz')).toBe(true);
      expect(predicate('has qux')).toBe(true);
    });

    it('OR-matches an array filterValue (programmatic In semantics)', () => {
      const predicate = fn(makeInfo(['foo', 'bar']));
      expect(predicate('has foo')).toBe(true);
      expect(predicate('has bar')).toBe(true);
      expect(predicate('has neither')).toBe(false);
    });

    it('drops empty segments from comma-string', () => {
      const predicate = fn(makeInfo('foo,,bar,'));
      expect(predicate('foo')).toBe(true);
      expect(predicate('bar')).toBe(true);
    });

    it('returns no matches when comma-string is all empty (",,,")', () => {
      const predicate = fn(makeInfo(',,,'));
      expect(predicate('anything')).toBe(false);
    });

  });

  describe('StringEquals', () => {
    const fn = StringFilterFuncs[FilterType.StringEquals];

    it('matches exact value (case-insensitive)', () => {
      const predicate = fn(makeInfo('Bob'));
      expect(predicate('bob')).toBe(true);
      expect(predicate('bobby')).toBe(false);
    });

    it('OR-matches a comma-separated string', () => {
      const predicate = fn(makeInfo('alice,bob'));
      expect(predicate('alice')).toBe(true);
      expect(predicate('bob')).toBe(true);
      expect(predicate('charlie')).toBe(false);
    });
  });

  describe('StringStartsWith', () => {
    const fn = StringFilterFuncs[FilterType.StringStartWith];

    it('matches by prefix', () => {
      const predicate = fn(makeInfo('foo'));
      expect(predicate('foobar')).toBe(true);
      expect(predicate('barfoo')).toBe(false);
    });

    it('OR-matches comma-separated prefixes', () => {
      const predicate = fn(makeInfo('CB-,SO-'));
      expect(predicate('CB-123')).toBe(true);
      expect(predicate('SO-456')).toBe(true);
      expect(predicate('PO-789')).toBe(false);
    });
  });

  describe('StringEndsWith', () => {
    const fn = StringFilterFuncs[FilterType.StringEndsWith];

    it('matches by suffix', () => {
      const predicate = fn(makeInfo('.com'));
      expect(predicate('test.com')).toBe(true);
      expect(predicate('test.org')).toBe(false);
    });

    it('OR-matches comma-separated suffixes', () => {
      const predicate = fn(makeInfo('.com,.io'));
      expect(predicate('foo.com')).toBe(true);
      expect(predicate('foo.io')).toBe(true);
      expect(predicate('foo.net')).toBe(false);
    });
  });

  describe('StringDoesNotContain', () => {
    const fn = StringFilterFuncs[FilterType.StringDoesNotContain];

    it('matches when substring is absent', () => {
      const predicate = fn(makeInfo('foo'));
      expect(predicate('hello bar')).toBe(true);
      expect(predicate('hello foo')).toBe(false);
    });

    it('does NOT split on commas (semantically NOT-OR is wrong)', () => {
      // "foo,bar" should match the literal string "foo,bar" — NOT split into terms
      const predicate = fn(makeInfo('foo,bar'));
      expect(predicate('contains foo,bar literally')).toBe(false);
      expect(predicate('contains only foo')).toBe(true);
    });
  });

  describe('FilterType.In', () => {
    const fn = StringFilterFuncs[FilterType.In];

    it('OR-matches an array of values', () => {
      const predicate = fn(makeInfo(['alice', 'bob']));
      expect(predicate('alice')).toBe(true);
      expect(predicate('bob')).toBe(true);
      expect(predicate('charlie')).toBe(false);
    });
  });
});
