import {Component, ViewEncapsulation, Input} from '@angular/core';
import {HostListener} from "@angular/core/src/metadata/directives";
import {layoutSizes} from "../../theme.constants";

export interface TableHeader {
  title:string;
  class:string;
}

export interface TableCell {
  valueHtml:string;
  class:string;
  truncateNumber:number; // 0=no truncate
}

export interface TableRow {
  cells:Array<TableCell>;
}

@Component({
  selector: 'mc-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcTable.html'),
  styles: [require('./mcTable.scss')]
})
export class McTable {
  @Input() tableHeaders: Array<TableHeader>;
  @Input() tableRows: Array<TableRow>;
  @Input() isLoading: boolean;
  @Input() onRowClick: (index:number) => void;
  private tableClass:string;
  constructor() {
    this.calculateTableClass();
  }
  @HostListener('window:resize')
  public onWindowResize():void {
    this.calculateTableClass();
  }

  private calculateTableClass():void {
    this.tableClass = (this.isWindowToSmall()?'mc-table-short':'mc-table');
  }

  private isWindowToSmall():boolean {
    return window.innerWidth <= layoutSizes.resWidthCollapseSidebar;
  }

  public hasRowData():boolean {
    return this.tableRows && this.tableRows.length > 0;
  }

  public clickedRow(index) {
    if (this.onRowClick) {
      this.onRowClick(index);
    }
  }
}
