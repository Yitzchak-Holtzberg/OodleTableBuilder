import { Component, ChangeDetectionStrategy, Input, TemplateRef, OnInit, HostBinding, ContentChild, ContentChildren, Predicate, Injector, viewChild, inject } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { MatColumnDef, MatTable, MatCell, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatFooterCellDef, MatFooterCell } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TransformCreator } from '../../services/transform-creator';
import { TableStore } from '../../classes/table-store';
import { map } from 'rxjs/operators';
import { TableTemplateService } from '../../services/table-template-service';
import { previousAndCurrent } from '../../../rxjs/rxjs-operators';
import { CdkDropList, CDK_DROP_LIST, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Dictionary } from '@ngrx/entity';
import { LetDirective } from '@ngrx/component';
import { MatTooltip } from '@angular/material/tooltip';
import { ConditionalClassesDirective } from '../../../utilities/directives/conditional-classes.directive';
import { StylerDirective } from '../../../utilities/directives/styler';
import { NgTemplateOutlet, AsyncPipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { ResizeColumnDirective } from '../../directives/resize-column.directive';
import { MatSortHeader } from '@angular/material/sort';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { SpaceCasePipe } from '../../../utilities/pipes/space-case.pipes';
import { ColumnTotalPipe } from '../../pipes/column-total.pipe';


interface widthStyle {
    flex?: string;
    maxWidth?: string;
}

interface allStyles {
  body: widthStyle;
  header: widthStyle;
  footer: widthStyle;
}

@Component({
    selector: 'tb-column-builder',
    templateUrl: './column-builder.component.html',
    styleUrls: ['./column-builder.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [
        { provide: CDK_DROP_LIST, useExisting: CdkDropList },
    ],
    imports: [LetDirective, MatColumnDef, MatCell, MatTooltip, ConditionalClassesDirective, StylerDirective, NgTemplateOutlet, MatHeaderCellDef, MatHeaderCell, CdkDrag, ResizeColumnDirective, CdkDragHandle, MatSortHeader, HeaderMenuComponent, MatCellDef, MatFooterCellDef, MatFooterCell, AsyncPipe, DecimalPipe, CurrencyPipe, SpaceCasePipe, ColumnTotalPipe]
})
export class ColumnBuilderComponent implements OnInit {
  private transformCreator = inject(TransformCreator);
  private table = inject<MatTable<any>>(MatTable);
  state = inject(TableStore);
  private templateService = inject(TableTemplateService);
  protected injector = inject(Injector);

  FieldType = FieldType;
  filter!: Partial<FilterInfo>;
  @Input() metaData!: MetaData;

  @Input() customCell!: CustomCellDirective;
  @Input() data$!: Observable<any[]>;

  readonly columnDef = viewChild.required(MatColumnDef);
  outerTemplate!: TemplateRef<any>;
  innerTemplate!: TemplateRef<any>;
  transform!: (o: any, ...args: any[])=> any ;

  readonly bodyTemplate = viewChild.required<TemplateRef<any>>('body');

  getInnerTemplate() :TemplateRef<any> {
    const metaData = this.metaData;
    if(metaData.template) return metaData.template;
    const TemplateRefValue = this.customCell?.TemplateRef;
    if (TemplateRefValue)  return TemplateRefValue;
    return this.templateService.getTemplate(metaData);
  }
  showfilters$!: Observable<boolean>;
  getOuterTemplate() {
    return this.customCell?.columnDef?.cell?.template ?? this.bodyTemplate();
  }
  classes?: Dictionary<Predicate<any>>;

  ngOnInit() {
    const metaData = this.metaData;
    if(metaData.fieldType === FieldType.Currency) {
      this.classes = {
        ['negative-currency']: (element) => element[this.metaData.key] < 0,
        ...metaData.classes
      }
    }
    else {
      this.classes = metaData.classes;
    }
    this.filter = {key: metaData.key, fieldType: metaData.fieldType};
    const width$ = this.state.getUserDefinedWidth$(metaData.key).pipe(
      previousAndCurrent(0),
      map(this.mapWidth),
    );
    const fullMetaStyles = metaData.additional?.styles ?? {};
    this.styles$ = width$.pipe(map(width => {
      const metaDataValue = this.metaData;
      const styles: allStyles = {
        header : {...fullMetaStyles,...metaDataValue.additional?.columnPartStyles?.header, ...width},
        footer: {...fullMetaStyles,...metaDataValue.additional?.columnPartStyles?.footer, ...width},
        body: {...fullMetaStyles,...metaDataValue.additional?.columnPartStyles?.body, ...width},
      };
      return styles;
    }));
    this.showfilters$ = this.state.tableSettings$.pipe(map(settings => !(settings.hideColumnHeaderFilters || this.metaData.noFilter)));
  }

  ngAfterViewInit() {
    this.outerTemplate = this.getOuterTemplate();
    this.innerTemplate = this.getInnerTemplate();
    this.transform = this.transformCreator.createTransformer(this.metaData);
    this.table.addColumnDef(this.columnDef());
  }

  cellClicked(element: any, key: string) {
    const metaData = this.metaData;
    if(metaData.click) {
      metaData.click(element,key);
    }
  }

  mapWidth = ([previousUserDefinedWidth, currentUserDefinedWidth] : [number, number]) : widthStyle => {
    const metaData = this.metaData;
    const baseWidth = !!metaData.width ? {flex:`0 0 ${metaData.width}`, maxWidth:'none'} : {flex:'1'};
    if( currentUserDefinedWidth ){
      return ({flex:`0 0 ${currentUserDefinedWidth}px`, maxWidth:'none'});
    } if( wasReset() ){
      return (baseWidth);
    }
    return ({});
    function wasReset(){
      return previousUserDefinedWidth >= 0 && currentUserDefinedWidth == null;
    }
  }

  styles$!:Observable<allStyles>

}
