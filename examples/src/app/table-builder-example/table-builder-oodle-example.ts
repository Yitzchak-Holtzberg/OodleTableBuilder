import { Component, ChangeDetectionStrategy, OnInit, ViewChildren, QueryList, ViewEncapsulation } from "@angular/core";
import { TableContainerComponent, TableBuilder, FieldType, FilterType, TableBuilderModule, VirtualScrollViewportDirective } from '../../../../projects/angular-utilities/src/public-api';
import { of } from "rxjs";
import { MatCell, MatCellDef } from "@angular/material/table";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";

import {
  presidentData, presidentSummaryMeta, presidentLinesMeta, flattenPresidentEvents,
} from './data/presidents.data';
import {
  monsterData, monsterSummaryMeta, monsterLinesMeta, flattenMonsterAppearances,
} from './data/monsters.data';
import {
  languageData, languageSummaryMeta, languageLinesMeta, flattenLanguageVersions,
} from './data/languages.data';

type DatasetKey = 'presidents' | 'monsters' | 'languages';

interface DatasetConfig {
  key: DatasetKey;
  label: string;
  summary: TableBuilder;
  lines: TableBuilder;
  /** Column used by the multi-value search repro, plus the values to search. */
  searchKey: string;
  searchValues: string[];
  /** A few values intentionally left OUT of the repro search so you can see them vanish. */
  omitted: string[];
}

@Component({
  selector: 'table-builder-oodle-example',
  templateUrl: './table-builder-oodle-example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./table-builder-oodle-example.component.css'],
  imports: [
    TableBuilderModule, MatCell, MatMenuTrigger, MatIcon, MatMenu, CommonModule,
    MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatSelectModule,
    MatCellDef, VirtualScrollViewportDirective,
  ],
})
export default class ChargebackComponent implements OnInit {

  selectedDataset: DatasetKey = 'presidents';
  isLinesView = false;

  /** Every rendered table is queried so the repro can target whichever is on screen. */
  @ViewChildren(TableContainerComponent) tableContainers!: QueryList<TableContainerComponent>;

  datasets: Record<DatasetKey, DatasetConfig> = {} as Record<DatasetKey, DatasetConfig>;
  datasetOptions: { key: DatasetKey; label: string }[] = [
    { key: 'presidents', label: 'U.S. Presidents' },
    { key: 'monsters', label: 'Movie Monsters' },
    { key: 'languages', label: 'Programming Languages' },
  ];

  ngOnInit() {
    this.datasets = {
      presidents: {
        key: 'presidents',
        label: 'U.S. Presidents',
        summary: new TableBuilder(of(presidentData), of(presidentSummaryMeta)),
        lines: new TableBuilder(of(flattenPresidentEvents(presidentData)), of(presidentLinesMeta)),
        searchKey: 'presidentName',
        searchValues: [...new Set(presidentData.map(p => p.presidentName))],
        omitted: ['Abraham Lincoln', 'John F. Kennedy', 'Franklin D. Roosevelt'],
      },
      monsters: {
        key: 'monsters',
        label: 'Movie Monsters',
        summary: new TableBuilder(of(monsterData), of(monsterSummaryMeta)),
        lines: new TableBuilder(of(flattenMonsterAppearances(monsterData)), of(monsterLinesMeta)),
        searchKey: 'monsterName',
        searchValues: monsterData.map(m => m.monsterName),
        omitted: ['Godzilla', 'King Kong', 'The Xenomorph'],
      },
      languages: {
        key: 'languages',
        label: 'Programming Languages',
        summary: new TableBuilder(of(languageData), of(languageSummaryMeta)),
        lines: new TableBuilder(of(flattenLanguageVersions(languageData)), of(languageLinesMeta)),
        searchKey: 'languageName',
        searchValues: languageData.map(l => l.languageName),
        omitted: ['Rust', 'Python', 'TypeScript'],
      },
    };
  }

  get currentConfig(): DatasetConfig {
    return this.datasets[this.selectedDataset];
  }

  get currentBuilder(): TableBuilder {
    return this.isLinesView ? this.currentConfig.lines : this.currentConfig.summary;
  }

  get currentTableId(): string {
    return `${this.selectedDataset}-${this.isLinesView ? 'lines' : 'summary'}`;
  }

  /**
   * Repro helper: applies a single multi-value "contains" search on the current
   * dataset's name column, using REAL values (a few intentionally omitted) so you
   * can verify the search actually filters. The long comma-separated value also
   * drives the active-filter displayer's collapse/overflow behavior, so we can
   * confirm it never covers the top-right 3-dot export menu.
   */
  addManyValueSearch() {
    const cfg = this.currentConfig;
    const omitted = new Set(cfg.omitted);
    const searched = cfg.searchValues.filter(v => !omitted.has(v));
    this.tableContainers?.first?.state.addFilter({
      key: cfg.searchKey,
      fieldType: FieldType.String,
      filterType: FilterType.StringContains,
      filterValue: searched.join(', '),
    } as any);
  }
}
