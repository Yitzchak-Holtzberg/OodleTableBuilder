import { Component, TemplateRef, ViewEncapsulation, viewChild, inject } from '@angular/core';
import { Subject, Observable, of, ReplaySubject } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { NgClass, AsyncPipe } from '@angular/common';
import {
  MetaData,
  FieldType,
  TableBuilder,
  TableContainerComponent,
  TableBuilderModule,
  FilterType,
  GeneralTableSettings,
  HttpRequestStateFactory
} from '../../../../projects/angular-utilities/src/public-api';
import { UtilitiesModule } from '../../../../projects/angular-utilities/src/utilities';
import { combineArrays } from '../../../../projects/angular-utilities/src/rxjs';
import { FilterInfo } from '../../../../projects/angular-utilities/src/table-builder/classes/filter-info';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatRowDef, MatRow } from '@angular/material/table';

type ElementBlock = 's' | 'p' | 'd' | 'f';
type ElementPhase = 'Solid' | 'Liquid' | 'Gas';
type DiscoveryYear = number | 'Ancient' | null;

export interface ElementCatalogRow {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number | string;
  category: string;
  group: number | null;
  period: number;
  block: ElementBlock;
  phaseAtRoomTemp: ElementPhase;
  discoveredYear: DiscoveryYear;
  discoveredBy: string | null;
  density: number | null;
  meltingPointC: number | null;
  boilingPointC: number | null;
  electronegativity: number | null;
  electronConfiguration: string;
  isRadioactive: boolean;
}

const elementRows: ElementCatalogRow[] = [
  {
    atomicNumber: 1,
    symbol: 'H',
    name: 'Hydrogen',
    atomicMass: '[1.00784, 1.00811]',
    category: 'Reactive nonmetal',
    group: 1,
    period: 1,
    block: 's',
    phaseAtRoomTemp: 'Gas',
    discoveredYear: 1766,
    discoveredBy: 'Henry Cavendish',
    density: 0.00008988,
    meltingPointC: -259.14,
    boilingPointC: -252.87,
    electronegativity: 2.2,
    electronConfiguration: '1s1',
    isRadioactive: false
  },
  {
    atomicNumber: 2,
    symbol: 'He',
    name: 'Helium',
    atomicMass: '4.002602',
    category: 'Noble gas',
    group: 18,
    period: 1,
    block: 's',
    phaseAtRoomTemp: 'Gas',
    discoveredYear: 1868,
    discoveredBy: 'Pierre Janssen and Norman Lockyer',
    density: 0.0001785,
    meltingPointC: -272.2,
    boilingPointC: -268.93,
    electronegativity: null,
    electronConfiguration: '1s2',
    isRadioactive: false
  },
  {
    atomicNumber: 3,
    symbol: 'Li',
    name: 'Lithium',
    atomicMass: '[6.938, 6.997]',
    category: 'Alkali metal',
    group: 1,
    period: 2,
    block: 's',
    phaseAtRoomTemp: 'Solid',
    discoveredYear: 1817,
    discoveredBy: 'Johan August Arfwedson',
    density: 0.534,
    meltingPointC: 180.54,
    boilingPointC: 1342,
    electronegativity: 0.98,
    electronConfiguration: '[He] 2s1',
    isRadioactive: false
  },
  {
    atomicNumber: 4,
    symbol: 'Be',
    name: 'Beryllium',
    atomicMass: '9.0121831',
    category: 'Alkaline earth metal',
    group: 2,
    period: 2,
    block: 's',
    phaseAtRoomTemp: 'Solid',
    discoveredYear: 1798,
    discoveredBy: 'Louis Nicolas Vauquelin',
    density: 1.85,
    meltingPointC: 1287,
    boilingPointC: 2469,
    electronegativity: 1.57,
    electronConfiguration: '[He] 2s2',
    isRadioactive: false
  },
  {
    atomicNumber: 5,
    symbol: 'B',
    name: 'Boron',
    atomicMass: '[10.806, 10.821]',
    category: 'Metalloid',
    group: 13,
    period: 2,
    block: 'p',
    phaseAtRoomTemp: 'Solid',
    discoveredYear: 1808,
    discoveredBy: 'Joseph Louis Gay-Lussac, Louis Jacques Thenard, and Humphry Davy',
    density: 2.34,
    meltingPointC: 2076,
    boilingPointC: 3927,
    electronegativity: 2.04,
    electronConfiguration: '[He] 2s2 2p1',
    isRadioactive: false
  },
  {
    atomicNumber: 6,
    symbol: 'C',
    name: 'Carbon',
    atomicMass: '[12.0096, 12.0116]',
    category: 'Reactive nonmetal',
    group: 14,
    period: 2,
    block: 'p',
    phaseAtRoomTemp: 'Solid',
    discoveredYear: 'Ancient',
    discoveredBy: null,
    density: 2.267,
    meltingPointC: 3550,
    boilingPointC: 4027,
    electronegativity: 2.55,
    electronConfiguration: '[He] 2s2 2p2',
    isRadioactive: false
  },
  {
    atomicNumber: 7,
    symbol: 'N',
    name: 'Nitrogen',
    atomicMass: '[14.00643, 14.00728]',
    category: 'Reactive nonmetal',
    group: 15,
    period: 2,
    block: 'p',
    phaseAtRoomTemp: 'Gas',
    discoveredYear: 1772,
    discoveredBy: 'Daniel Rutherford',
    density: 0.0012506,
    meltingPointC: -210,
    boilingPointC: -195.79,
    electronegativity: 3.04,
    electronConfiguration: '[He] 2s2 2p3',
    isRadioactive: false
  },
  {
    atomicNumber: 8,
    symbol: 'O',
    name: 'Oxygen',
    atomicMass: '[15.99903, 15.99977]',
    category: 'Reactive nonmetal',
    group: 16,
    period: 2,
    block: 'p',
    phaseAtRoomTemp: 'Gas',
    discoveredYear: 1774,
    discoveredBy: 'Joseph Priestley and Carl Wilhelm Scheele',
    density: 0.001429,
    meltingPointC: -218.79,
    boilingPointC: -182.96,
    electronegativity: 3.44,
    electronConfiguration: '[He] 2s2 2p4',
    isRadioactive: false
  },
  {
    atomicNumber: 9,
    symbol: 'F',
    name: 'Fluorine',
    atomicMass: '18.998403162',
    category: 'Reactive nonmetal',
    group: 17,
    period: 2,
    block: 'p',
    phaseAtRoomTemp: 'Gas',
    discoveredYear: 1886,
    discoveredBy: 'Henri Moissan',
    density: 0.001696,
    meltingPointC: -219.67,
    boilingPointC: -188.11,
    electronegativity: 3.98,
    electronConfiguration: '[He] 2s2 2p5',
    isRadioactive: false
  },
  {
    atomicNumber: 10,
    symbol: 'Ne',
    name: 'Neon',
    atomicMass: '20.1797',
    category: 'Noble gas',
    group: 18,
    period: 2,
    block: 'p',
    phaseAtRoomTemp: 'Gas',
    discoveredYear: 1898,
    discoveredBy: 'William Ramsay and Morris Travers',
    density: 0.0008999,
    meltingPointC: -248.59,
    boilingPointC: -246.08,
    electronegativity: null,
    electronConfiguration: '[He] 2s2 2p6',
    isRadioactive: false
  }
];

const sampleElement: ElementCatalogRow = {
  atomicNumber: 43,
  symbol: 'Tc',
  name: 'Technetium',
  atomicMass: '[97]',
  category: 'Transition metal',
  group: 7,
  period: 5,
  block: 'd',
  phaseAtRoomTemp: 'Solid',
  discoveredYear: 1937,
  discoveredBy: 'Carlo Perrier and Emilio Segre',
  density: 11,
  meltingPointC: 2157,
  boilingPointC: 4265,
  electronegativity: 1.9,
  electronConfiguration: '[Kr] 4d5 5s2',
  isRadioactive: true
};

const META_DATA: MetaData<ElementCatalogRow, ['stabilityStatus']>[] = [
  {key: 'atomicNumber', fieldType: FieldType.Number, displayName: 'Atomic Number', order: 1, width: '130px'},
  {key: 'symbol', fieldType: FieldType.String, displayName: 'Symbol', order: 2, width: '92px', noFilter: true},
  {
    key: 'name',
    fieldType: FieldType.Link,
    displayName: 'Name',
    order: 3,
    width: '150px',
    additional: {
      link: {
        interpolatedRoute: 'https://pubchem.ncbi.nlm.nih.gov/element/{atomicNumber}',
        target: '_blank' as any
      },
      filterOptions: { filterableValues : ['Hydrogen', 'Lithium', 'Oxygen', 'Neon']}
    }
  },
  {key: 'atomicMass', fieldType: FieldType.String, displayName: 'Atomic Mass', order: 4, width: '170px'},
  {key: 'category', fieldType: FieldType.String, displayName: 'Category', order: 5, width: '190px'},
  {key: 'group', fieldType: FieldType.Number, displayName: 'Group', order: 6, width: '90px'},
  {key: 'period', fieldType: FieldType.Number, displayName: 'Period', order: 7, width: '90px'},
  {key: 'block', fieldType: FieldType.String, displayName: 'Block', order: 8, width: '85px'},
  {key: 'phaseAtRoomTemp', fieldType: FieldType.String, displayName: 'Room Temp Phase', order: 9, width: '150px'},
  {key: 'discoveredYear', fieldType: FieldType.String, displayName: 'Discovered', order: 10, width: '120px'},
  {key: 'discoveredBy', fieldType: FieldType.String, displayName: 'Discovered By', order: 11, width: '260px'},
  {key: 'density', fieldType: FieldType.Number, displayName: 'Density', order: 12, width: '110px'},
  {key: 'meltingPointC', fieldType: FieldType.Number, displayName: 'Melting Point', order: 13, width: '140px'},
  {key: 'boilingPointC', fieldType: FieldType.Number, displayName: 'Boiling Point', order: 14, width: '140px'},
  {key: 'electronegativity', fieldType: FieldType.Number, displayName: 'Electronegativity', order: 15, width: '150px'},
  {key: 'electronConfiguration', fieldType: FieldType.String, displayName: 'Electron Configuration', order: 16, width: '220px'},
  {key: 'isRadioactive', fieldType: FieldType.Boolean, displayName: 'Radioactive', order: 17, width: '130px'},
];

@Component({
    selector: 'app-table-builder-example',
    templateUrl: './table-builder-example.component.html',
    styleUrls: ['./table-builder-example.component.css'],
    providers: [HttpRequestStateFactory],
    encapsulation: ViewEncapsulation.None,
    imports: [TableBuilderModule, UtilitiesModule, MatCheckbox, MatFormField, MatSelect, MatOption, FormsModule, NgClass, MatRowDef, MatRow, AsyncPipe]
})
export class TableBuilderExampleComponent {
  private store = inject<Store<any>>(Store);
  private reqfac = inject(HttpRequestStateFactory);

  req = this.reqfac.create(() => of([1,2,3]));
  FilterTypes = FilterType;
  FieldTypes = FieldType;
  public tableBuilder!: TableBuilder;
  newElement$ = new Subject<ElementCatalogRow>();
  metaData$ = new ReplaySubject<MetaData<ElementCatalogRow, ['stabilityStatus']>[]>();
  myFilter = new Subject<Array<(val: ElementCatalogRow) => boolean>>();
  s$ = new Subject();

  myTestPredicate = (row: ElementCatalogRow) => row.symbol === 'O' || row.name === 'Oxygen';
  quickFilters = [
    { label: 'Oxygen only', predicate: (row: ElementCatalogRow) => row.symbol === 'O' },
    { label: 'Gases', predicate: (row: ElementCatalogRow) => row.phaseAtRoomTemp === 'Gas' },
    { label: 'Solids', predicate: (row: ElementCatalogRow) => row.phaseAtRoomTemp === 'Solid' },
    { label: 'Noble gases', predicate: (row: ElementCatalogRow) => row.category === 'Noble gas' },
    { label: 'Metals', predicate: (row: ElementCatalogRow) => row.category.toLowerCase().includes('metal') },
    { label: 'Radioactive', predicate: (row: ElementCatalogRow) => row.isRadioactive },
    { label: 'Ancient discovery', predicate: (row: ElementCatalogRow) => row.discoveredYear === 'Ancient' },
    { label: 'Known electronegativity', predicate: (row: ElementCatalogRow) => row.electronegativity !== null }
  ];

  readonly tableContainer = viewChild.required(TableContainerComponent);
  readonly t = viewChild.required<TemplateRef<any>>('myTemplate');

  isFilterChecked!: Observable<FilterInfo>;
  runWhen = () => true;

  emitter(d) {
    // console.log(d);
  }

  getLotsOfData() {
    let lotsOfData: ElementCatalogRow[] = [];
    for (let i = 0; i < 1000; i++) {
      lotsOfData.push(...elementRows);
    }
    return lotsOfData;
  }

  ngAfterViewInit() {
    const addedElements = this.newElement$.pipe(
      scan((acc, value) => { acc.push(value); return acc; }, [] as ElementCatalogRow[]),
      startWith([]),
    );
    const all = combineArrays([of(elementRows), addedElements]);
    this.metaData$.next(META_DATA);

    setTimeout(() => {
      this.tableBuilder = new TableBuilder(
        all,
        this.metaData$,
        {
          headerSettings: {hideHeader: false},
          columnHeaderSettings: {noFilters: false}
        } as GeneralTableSettings
      );
    }, 0);
  }

  addColumn() {
    this.metaData$.next([
      ...META_DATA.filter(f => String(f.key) !== 'stabilityStatus'),
      {
        key: 'stabilityStatus',
        fieldType: FieldType.Expression,
        displayName: 'Stability',
        order: 18,
        width: '170px',
        transform: (element: ElementCatalogRow) => {
          if (element.isRadioactive) return 'Radioactive';
          if (element.atomicNumber > 92) return 'Synthetic';
          if ([element.density, element.meltingPointC, element.boilingPointC, element.electronegativity].some(value => value == null)) {
            return 'Unknown property data';
          }
          return 'Stable';
        },
        additional: {columnPartStyles: {body: {color: '#176d72', fontWeight: '600'}}}
      } as any
    ]);
  }

  addItem() {
    this.newElement$.next(sampleElement);
    this.metaData$.next(META_DATA);
  }

  emitFilter() {
    this.myFilter.next([
      element => element.density !== null
    ]);
  }

  clearFilter() {
    this.myFilter.next([]);
  }

  Checked(input: MatCheckboxChange) {
    if (input.checked) {
      const fi = {
        filterId: 'test',
        filterType: FilterType.NumberEquals,
        filterValue: 5,
        key: 'atomicNumber',
        fieldType: FieldType.Number
      };
      this.tableContainer().state.addFilter(fi);
    } else {
      this.tableContainer().state.removeFilter('test');
    }
  }

  multipleValuesTest(change: MatSelectChange) {
    const fi = {
      filterId: 'multipleValuesTest',
      filterType: FilterType.In,
      filterValue: change.value.map(v => v),
      key: 'category',
      fieldType: FieldType.String
    };

    this.tableContainer().state.addFilter(fi);
  }

  selectionEvent(a) {
    console.log('selection emit: ', a);
  }

  clearAllFilters() {
    this.tableContainer().state.clearFilters();
  }
}
