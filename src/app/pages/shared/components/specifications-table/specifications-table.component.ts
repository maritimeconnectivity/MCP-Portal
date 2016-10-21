import {Component, ViewEncapsulation, Input, OnChanges} from '@angular/core';
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {TableRow, TableHeader, TableCell} from "../../../../../theme/components/mcTable/mcTable.component";

@Component({
  selector: 'specifications-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./specifications-table.html'),
  styles: []
})
export class SpecificationsTableComponent implements OnChanges {
  @Input() specifications: Array<Specification>;
  @Input() isLoading: boolean;
  @Input() onRowClick: (index:number) => void;
  public tableHeaders: Array<TableHeader>;
  public tableRows: Array<TableRow>;
  constructor() {
  }
  ngOnInit() {
  }
  ngOnChanges() {
    if (this.specifications) {
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

    for (let specification of this.specifications) {
      var cells:Array<TableCell> = [];

      var tableCell: TableCell = {valueHtml:specification.name, class:'', truncateNumber:50};
      cells.push(tableCell);

      tableCell = {valueHtml:specification.version, class:'nowrap align-center', truncateNumber:0};
      cells.push(tableCell);

      tableCell = {valueHtml:specification.status, class:'nowrap', truncateNumber:0};
      cells.push(tableCell);

      tableCell = {valueHtml:specification.description, class:'table-description', truncateNumber:250};
      cells.push(tableCell);

      let tableRow: TableRow = {cells: cells};
      tableRows.push(tableRow);
    }

    this.tableHeaders = tableHeaders;
    this.tableRows = tableRows;
  }



}
