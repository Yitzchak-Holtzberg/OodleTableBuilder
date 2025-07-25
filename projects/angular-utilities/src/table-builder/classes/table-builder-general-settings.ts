import { merge } from "lodash";

export class GeneralTableSettings {
  constructor(settings? : TableBuilderSettings){
    if(settings){
      merge(this.headerSettings, settings.headerSettings);
      merge(this.footerSettings, settings.footerSettings);
      merge(this.columnHeaderSettings, settings.columnHeaderSettings);
    }
  }
  headerSettings = new TableWrapperHeaderSettings();
  footerSettings = new TableWrapperFooterSettings();
  columnHeaderSettings = new TableColumnHeaderSettings();
}

export interface TableBuilderSettings {
  headerSettings? : Partial<TableWrapperHeaderSettings>;
  footerSettings? : Partial<TableWrapperFooterSettings>;
  columnHeaderSettings? : Partial<TableColumnHeaderSettings>;
}

export class TableWrapperHeaderSettings {
  hideExport = false
  hideFilter = false
  hideColumnSettings = false
  hideHeader = false
  hideSort = false
  collapse = false
  showTitleWhenCollapsed = true;
}

export class TableWrapperFooterSettings {
  collapse = false
}

export class TableColumnHeaderSettings {
  noFilters = false;
  noHeader = false;
}

export class PesrsistedTableSettings {
  constructor(tableSettings? :GeneralTableSettings | PesrsistedTableSettings){
    if (tableSettings){
      this.collapseHeader = (tableSettings as GeneralTableSettings).headerSettings?.collapse ?? (tableSettings as PesrsistedTableSettings).collapseHeader;
      this.collapseFooter = (tableSettings as GeneralTableSettings).footerSettings?.collapse ?? (tableSettings as PesrsistedTableSettings).collapseFooter;
    }
  }
  collapseHeader = false;
  collapseFooter = false;
}

export class NotPersisitedTableSettings {
  constructor(tableSettings? :GeneralTableSettings){
    if(tableSettings){
      this.hideExport = tableSettings.headerSettings.hideExport;
      this.hideColumnSettings = tableSettings.headerSettings.hideColumnSettings;
      this.hideFilter = tableSettings.headerSettings.hideFilter;
      this.hideSort = tableSettings.headerSettings.hideSort;
      this.showTitleWhenHeaderCollapsed = tableSettings.headerSettings.showTitleWhenCollapsed;
      this.hideHeader = tableSettings.headerSettings.hideHeader;
      this.hideColumnHeaderFilters = tableSettings.columnHeaderSettings.noFilters;
      this.hideColumnHeader = tableSettings.columnHeaderSettings.noHeader;
    }
  }
  hideExport = true
  hideFilter = true
  hideColumnSettings = true
  hideSort = true
  showTitleWhenHeaderCollapsed = true;
  hideHeader = true
  hideColumnHeaderFilters = true;
  hideColumnHeader = true;
}
