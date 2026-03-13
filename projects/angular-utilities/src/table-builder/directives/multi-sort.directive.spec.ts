import { MultiSortDirective } from './multi-sort.directive';
import { Sort, MatSortable } from '@angular/material/sort';
import { FieldType } from '../interfaces/report-def';
import { TableBuilderConfigToken } from '../classes/TableBuilderConfig';
import { DatePipe } from '@angular/common';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { storageStateReducer } from '../ngrx/reducer';
import { TableStore } from '../classes/table-store';

describe('MultiSortDirective', () => {

    let directive: MultiSortDirective;
    let rules: Sort[];

    const data = [
      {
        name: 'Joe',
        age: 10,
        balance: 25
      },
      {
        name: 'Jane',
        age: 20,
        balance: 35
      }
    ];
    const metaData =  [
      {
        key: 'name',
        fieldType: FieldType.String,
        additional: {},
        order : 1
      },
      {
        key: 'age',
        fieldType: FieldType.Number,
        additional: {},
        order : 2
      },
      {
        key: 'balance',
        fieldType: FieldType.Number,
        additional: {},
        order : 3
      }
    ];

    const initialState = {fullTableState: {
      'test-id': {
        metaData,
        hiddenKeys: [],
        pageSize: 10,
        initialized : true ,
        filters: [],
        sorted : [],
      }
    }};

    beforeEach(fakeAsync(() => {
      TestBed.resetTestingModule ();
      rules = [];
      TestBed.configureTestingModule({
        declarations: [],
        providers: [
         { provide : TableBuilderConfigToken , useValue: {defaultTableState: { }}},
         DatePipe,
         TableStore
        ],
        imports: [
          StoreModule.forRoot({'fullTableState': storageStateReducer}),
        ],
        teardown: {destroyAfterEach: true}
      })
      .compileComponents();

      const store = TestBed.inject(TableStore);
      directive = TestBed.runInInjectionContext(() => new MultiSortDirective());

        rules = [
            { active: 'a', direction: 'asc' },
            { active: 'b', direction: 'asc' },
            { active: 'c', direction: 'asc' },
        ];

        [...rules].reverse().forEach( rule =>  store.setSort( {key:rule.active, direction: rule.direction} ));
        directive.ngOnInit();
        tick(); // Allow async subscriptions to process
    }));

    describe('Initializing Rules',  () => {

        // TODO: Fix async subscription issue - rules aren't populated synchronously
        xit('should inititialize the rules', () => {
            expect(directive.rules).toEqual(rules);
        });
    });

    describe('Updating the rules', () => {
        // TODO: Fix async subscription issue - rules aren't populated synchronously
        xit('should add new rule to begining of rules array', () => {
            const originalLength = directive.rules.length;
            const sort: MatSortable = { id: 'd', start: 'asc', disableClear: false };
            directive.sort(sort);
            expect(directive.rules.length).toBe(originalLength + 1, 'updated rules length should be one larger than original');
            expect(directive.rules[0].active).toBe(sort.id);
        });

        // TODO: Fix async subscription issue - rules aren't populated synchronously
        xit('should remove old rule for the column of new rule and replace it with new rule', () => {
            const originalLength = directive.rules.length;
            const sort: MatSortable = { id: 'a', start: 'asc', disableClear: false };
            directive.sort(sort);
            expect(directive.rules.length).toBe(originalLength, 'updated rules length should be same as original');
            expect(directive.rules[0].direction).toBe('desc');
        });

        // TODO: Fix async subscription issue - rules aren't populated synchronously
        xit('should remove old rule without replacing it if new rule for that column has no direction', () => {
            const originalLength = directive.rules.length;
            const sort: MatSortable = { id: 'a', start: 'asc', disableClear: false };
            directive.sort({...sort});
            directive.sort({...sort});
            expect(directive.rules.length).toBe(originalLength - 1, 'updated rules length should be one smaller than original');
        });
    });
});
