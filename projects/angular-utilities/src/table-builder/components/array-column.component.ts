import { ChangeDetectionStrategy, Component, Input, Inject } from '@angular/core';
import { ArrayStyle, ArrayAdditional, MetaData } from '../interfaces/report-def';
import { TableBuilderConfigToken, TableBuilderConfig } from '../classes/TableBuilderConfig';



@Component({
    selector: 'tb-array-column',
    template: `
  @if (array.length === 0) {
    -
  } @else {
    @switch (additional.arrayStyle) {
      @case (ArrayStyle.CommaDelimited) {
        @for (val of array; track val; let isLast = $last) {
          <span>{{val}}@if (!isLast) {
            ,
          } </span>
        }
      }
      @case (ArrayStyle.NewLine) {
        @for (val of array; track val; let isLast = $last) {
          <span>{{val}}@if (!isLast) {
            <br />
          } </span>
        }
      }
    }
  }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class ArrayColumnComponent {
  ArrayStyle = ArrayStyle;
  additional!: ArrayAdditional;
  @Input() array!: any[];
  @Input() metaData!: MetaData;

  constructor( @Inject(TableBuilderConfigToken) private config: TableBuilderConfig
    ) {

  }

  ngOnInit() {
    this.additional = this.metaData?.additional ??  this.config.arrayInfo ?? { limit: 3, arrayStyle: ArrayStyle.NewLine } as ArrayAdditional;
    this.array = (this.array ?? []).slice(0, this.additional.limit );

  }
}
