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

export interface TableActionButton {
	buttonClass:string;
	onClick:Function;
	name:string;
}

export interface TableCellActionButtons extends TableCell {
	actionButtons:Array<TableActionButton>;
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
  @Input() onRowClick?: (index:number) => void;
  public tableClass:string;
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
    return window.innerWidth <= layoutSizes.resWidthCollapseSidebar + 200; // Sorry for magic number. Just works the best
  }

  public hasRowData():boolean {
    return this.tableRows && this.tableRows.length > 0;
  }

  public clickedCell(index, cell:any) {
    if (this.onRowClick && !cell.actionButtons) {
      this.onRowClick(index);
    }
  }

  public clickedButton(button:TableActionButton){
	  if (button.onClick) {
		  button.onClick()
	  }

  }
}
