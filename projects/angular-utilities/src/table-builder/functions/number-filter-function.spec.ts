import { NumberFilterFuncs } from './number-filter-function';
import { FilterType } from '../enums/filterTypes';
import { FilterInfo } from '../classes/filter-info';

const makeInfo = (filterValue: any): FilterInfo => ({
  filterId: 'test',
  key: 'k',
  filterType: FilterType.NumberEquals,
  filterValue,
} as FilterInfo);

describe('NumberFilterFuncs', () => {

  describe('NumberEquals', () => {
    const fn = NumberFilterFuncs[FilterType.NumberEquals];

    it('matches exact numeric value', () => {
      const predicate = fn(makeInfo(5));
      expect(predicate(5)).toBe(true);
      expect(predicate(6)).toBe(false);
    });

    it('OR-matches a comma-separated string of numbers', () => {
      const predicate = fn(makeInfo('1,2,3'));
      expect(predicate(1)).toBe(true);
      expect(predicate(2)).toBe(true);
      expect(predicate(3)).toBe(true);
      expect(predicate(4)).toBe(false);
    });

    it('OR-matches an array of numbers', () => {
      const predicate = fn(makeInfo([10, 20]));
      expect(predicate(10)).toBe(true);
      expect(predicate(20)).toBe(true);
      expect(predicate(30)).toBe(false);
    });

    it('trims whitespace around comma-separated values', () => {
      const predicate = fn(makeInfo('  1  ,  2  '));
      expect(predicate(1)).toBe(true);
      expect(predicate(2)).toBe(true);
    });

    it('drops non-numeric segments from comma-string', () => {
      const predicate = fn(makeInfo('1,abc,2'));
      expect(predicate(1)).toBe(true);
      expect(predicate(2)).toBe(true);
      // 'abc' is silently dropped, not matched as 0 or NaN
      expect(predicate(0)).toBe(false);
    });

    it('does not split a single non-comma value', () => {
      const predicate = fn(makeInfo(42));
      expect(predicate(42)).toBe(true);
    });
  });

  describe('NumberGreaterThan', () => {
    const fn = NumberFilterFuncs[FilterType.NumberGreaterThan];

    it('matches values strictly greater', () => {
      const predicate = fn(makeInfo(10));
      expect(predicate(11)).toBe(true);
      expect(predicate(10)).toBe(false);
      expect(predicate(9)).toBe(false);
    });
  });

  describe('NumberLessThan', () => {
    const fn = NumberFilterFuncs[FilterType.NumberLessThan];

    it('matches values strictly less', () => {
      const predicate = fn(makeInfo(10));
      expect(predicate(9)).toBe(true);
      expect(predicate(10)).toBe(false);
      expect(predicate(11)).toBe(false);
    });
  });

  describe('NumberBetween', () => {
    const fn = NumberFilterFuncs[FilterType.NumberBetween];

    it('matches values strictly between Start and End', () => {
      const predicate = fn(makeInfo({ Start: 5, End: 10 }));
      expect(predicate(7)).toBe(true);
      expect(predicate(5)).toBe(false);
      expect(predicate(10)).toBe(false);
      expect(predicate(11)).toBe(false);
    });
  });
});
