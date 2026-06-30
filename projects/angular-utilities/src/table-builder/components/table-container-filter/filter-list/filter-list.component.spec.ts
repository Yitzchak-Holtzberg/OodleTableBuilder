import { TestBed, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { FilterChipsComponent } from './filter-list.component';
import { MaterialModule } from '../../../material.module';
import { TableBuilderModule } from '../../../table-builder.module';
import { TableStore } from '../../../classes/table-store';
import { WrapperFilterStore } from '../table-wrapper-filter-store';
import { FieldType } from '../../../interfaces/report-def';
import { FilterType } from '../../../enums/filterTypes';

describe('FilterChipsComponent (inline filter list)', () => {
  let fixture: ComponentFixture<FilterChipsComponent>;
  let component: FilterChipsComponent;
  let store: TableStore;

  const manyValues = Array.from({ length: 30 }, (_, i) => `SKU-${i + 1}`);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableStore,
        WrapperFilterStore,
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ],
      imports: [
        NoopAnimationsModule,
        MaterialModule,
        CommonModule,
        FormsModule,
        TableBuilderModule.forRoot({ defaultTableState: { sorted: [] } }),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterChipsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(TableStore);
    store.setMetaData([
      { key: 'sku', displayName: 'SKU', fieldType: FieldType.String } as any,
    ]);
  });

  const addFilterWithValues = (values: string[]) => {
    store.addFilter({
      key: 'sku',
      fieldType: FieldType.String,
      filterType: FilterType.StringContains,
      filterValue: values.join(', '),
    } as any);
    fixture.detectChanges();
  };

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  describe('expand state', () => {
    it('toggleExpanded flips and isExpanded reflects it', () => {
      expect(component.isExpanded('a')).toBe(false);
      component.toggleExpanded('a');
      expect(component.isExpanded('a')).toBe(true);
      component.toggleExpanded('a');
      expect(component.isExpanded('a')).toBe(false);
    });

    it('tracks expand state independently per filter id', () => {
      component.toggleExpanded('a');
      expect(component.isExpanded('a')).toBe(true);
      expect(component.isExpanded('b')).toBe(false);
    });
  });

  describe('rendering', () => {
    it('renders each value as a pill when at or below the inline threshold', () => {
      addFilterWithValues(['A', 'B', 'C']); // == maxInlinePills (3)
      const pills = fixture.debugElement.queryAll(By.css('.filter-value-pill'));
      expect(pills.length).toBe(3);
      expect(fixture.debugElement.query(By.css('.fp-pills-count'))).toBeNull();
    });

    it('collapses to a count pill when above the inline threshold', () => {
      addFilterWithValues(manyValues); // 30 values
      const countPill = fixture.debugElement.query(By.css('.fp-pills-count'));
      expect(countPill).not.toBeNull();
      expect(countPill.nativeElement.textContent).toContain('30 values');
      // collapsed: no individual value pills rendered
      expect(fixture.debugElement.queryAll(By.css('.filter-value-pill')).length).toBe(0);
    });

    it('expands into a popover showing all values when the count pill is clicked', () => {
      addFilterWithValues(manyValues);
      fixture.debugElement.query(By.css('.fp-pills-count')).nativeElement.click();
      fixture.detectChanges();
      const pills = fixture.debugElement.queryAll(By.css('.fp-pill-overflow .filter-value-pill'));
      expect(pills.length).toBe(manyValues.length);
      // count pill stays visible while expanded (toggles the arrow)
      expect(fixture.debugElement.query(By.css('.fp-pills-count'))).not.toBeNull();
    });
  });

  describe('removeValue', () => {
    it('removes a single value and re-applies the filter with the rest', () => {
      component.removeValue(
        { filterId: 'f1', key: 'sku', fieldType: FieldType.String } as any,
        ['A', 'B', 'C'],
        'B',
      );
      const filters = (store as any).get((s: any) => s.filters);
      expect(filters['f1'].filterValue).toBe('A, C');
    });

    it('collapses to a single value (not a list) when one remains', () => {
      component.removeValue(
        { filterId: 'f1', key: 'sku', fieldType: FieldType.String } as any,
        ['A', 'B'],
        'B',
      );
      const filters = (store as any).get((s: any) => s.filters);
      expect(filters['f1'].filterValue).toBe('A');
    });

    it('removes the whole filter when the last value is removed', () => {
      store.addFilter({ filterId: 'f1', key: 'sku', fieldType: FieldType.String, filterType: FilterType.StringContains, filterValue: 'A' } as any);
      component.removeValue(
        { filterId: 'f1', key: 'sku', fieldType: FieldType.String } as any,
        ['A'],
        'A',
      );
      const filters = (store as any).get((s: any) => s.filters);
      expect(filters['f1']).toBeUndefined();
    });
  });

  describe('inline value edit (per-value, inside the dropdown)', () => {
    const strFilter = { filterId: 'f1', key: 'sku', fieldType: FieldType.String } as any;

    it('treats text field types as inline-editable and others not', () => {
      expect(component.isInlineEditable({ fieldType: FieldType.String } as any)).toBe(true);
      expect(component.isInlineEditable({ fieldType: FieldType.Date } as any)).toBe(false);
      expect(component.isInlineEditable({ fieldType: FieldType.Number } as any)).toBe(false);
    });

    it('startValueEdit marks a specific value index as editing (text filters only)', () => {
      component.startValueEdit(strFilter, 2);
      expect(component.isEditingValue('f1', 2)).toBe(true);
      expect(component.isEditingValue('f1', 1)).toBe(false);
      component.cancelEdit();
      component.startValueEdit({ filterId: 'f2', key: 'when', fieldType: FieldType.Date } as any, 0);
      expect(component.isEditingValue('f2', 0)).toBe(false); // non-text not inline-editable
    });

    it('commitValueEdit replaces just that value and re-applies the filter', () => {
      component.editingValueKey = 'f1#1';
      component.commitValueEdit(strFilter, ['A', 'B', 'C'], 1, '  Bee  ');
      const filters = (store as any).get((s: any) => s.filters);
      expect(filters['f1'].filterValue).toBe('A, Bee, C');
      expect(component.isEditingValue('f1', 1)).toBe(false);
    });

    it('commitValueEdit with an empty value drops just that value', () => {
      component.editingValueKey = 'f1#1';
      component.commitValueEdit(strFilter, ['A', 'B', 'C'], 1, '   ');
      const filters = (store as any).get((s: any) => s.filters);
      expect(filters['f1'].filterValue).toBe('A, C');
    });

    it('commitValueEdit removes the filter when the last value is cleared', () => {
      store.addFilter({ filterId: 'f1', key: 'sku', fieldType: FieldType.String, filterType: FilterType.StringContains, filterValue: 'A' } as any);
      component.editingValueKey = 'f1#0';
      component.commitValueEdit(strFilter, ['A'], 0, '');
      const filters = (store as any).get((s: any) => s.filters);
      expect(filters['f1']).toBeUndefined();
    });
  });
});
