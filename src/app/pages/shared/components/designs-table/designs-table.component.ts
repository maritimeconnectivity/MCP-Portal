import {Component, ViewEncapsulation, Input, OnChanges} from '@angular/core';
import {Design} from "../../../../backend-api/service-registry/autogen/model/Design";
import {TableHeader, TableRow, TableCell} from "../../../../theme/components/mcTable/mcTable.component";

@Component({
  selector: 'designs-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./designs-table.html'),
  styles: []
})
export class DesignsTableComponent implements OnChanges {
  @Input() designs: Array<Design>;
  @Input() isLoading: boolean;
  @Input() onRowClick: (index:number) => void;
  public tableHeaders: Array<TableHeader>;
  public tableRows: Array<TableRow>;
  constructor() {
  }
  ngOnInit() {
  }
  ngOnChanges() {
    if (this.designs) {
      this.generateHeadersAndRows();
    }
  }
  private generateHeadersAndRows() {
    var tableHeaders: Array<TableHeader> = [];
    var tableRows: Array<TableRow> = [];

    var tableHeader: TableHeader = {title:'Name', class:''};
    tableHeaders.push(tableHeader);

    tableHeader = {title:'Version', class:'nowrap align-center'};
    tableHeaders.push(tableHeader);

    tableHeader = {title:'Status', class:'nowrap'};
    tableHeaders.push(tableHeader);

    tableHeader = {title:'Description', class:''};
    tableHeaders.push(tableHeader);

    for (let design of this.designs) {
      var cells:Array<TableCell> = [];

      var tableCell: TableCell = {valueHtml:design.name, class:'', truncateNumber:50};
      cells.push(tableCell);

      tableCell = {valueHtml:design.version, class:'nowrap align-center', truncateNumber:0};
      cells.push(tableCell);

      tableCell = {valueHtml:design.status, class:'nowrap', truncateNumber:0};
      cells.push(tableCell);

      tableCell = {valueHtml:design.description, class:'table-description', truncateNumber:250};
      cells.push(tableCell);

      let tableRow: TableRow = {cells: cells};
      tableRows.push(tableRow);
    }

    this.tableHeaders = tableHeaders;
    this.tableRows = tableRows;
  }
}
