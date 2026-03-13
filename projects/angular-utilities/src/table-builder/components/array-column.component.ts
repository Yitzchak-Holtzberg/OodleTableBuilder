import { ChangeDetectionStrategy, Component, Input, input, inject } from '@angular/core';
import { ArrayStyle, ArrayAdditional, MetaData } from '../interfaces/report-def';
import { TableBuilderConfigToken, TableBuilderConfig } from '../classes/TableBuilderConfig';


@Component({
    selector: 'tb-array-column',
    template: `
  @if (!array || array.length === 0) {
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrayColumnComponent {
  private config = inject<TableBuilderConfig>(TableBuilderConfigToken);

  ArrayStyle = ArrayStyle;
  additional!: ArrayAdditional;
  @Input() array!: any[];
  readonly metaData = input.required<MetaData>();

  ngOnInit() {
    this.additional = this.metaData()?.additional ??  this.config.arrayInfo ?? { limit: 3, arrayStyle: ArrayStyle.NewLine } as ArrayAdditional;
    this.array = (this.array ?? []).slice(0, this.additional.limit );

  }
}
