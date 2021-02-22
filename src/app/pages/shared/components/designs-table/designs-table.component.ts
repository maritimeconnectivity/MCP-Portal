import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { Design } from "../../../../backend-api/service-registry/autogen/model/Design";
import {
    TableCell,
    TableHeader,
    TableRow
} from "../../../../theme/components/mcTable/mcTable.component";
import {
    MCNotificationsService,
    MCNotificationType
} from "../../../../shared/mc-notifications.service";
import { OrganizationsService } from "../../../../backend-api/identity-registry/services/organizations.service";

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
  constructor(private orgsService: OrganizationsService, private notifications: MCNotificationsService) {
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

	  tableHeader = {title:'Organization', class:'nowrap'};
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

	    tableCell = {valueHtml:'', class:'nowrap', truncateNumber:30};
	    this.setOrganizationCell(tableCell, design.organizationId);
	    cells.push(tableCell);

      tableCell = {valueHtml:design.description, class:'table-description', truncateNumber:250};
      cells.push(tableCell);

      let tableRow: TableRow = {cells: cells};
      tableRows.push(tableRow);
    }

    this.tableHeaders = tableHeaders;
    this.tableRows = tableRows;
  }

	private setOrganizationCell(tableCell: TableCell, organizationId) {
		this.orgsService.getOrganizationName(organizationId).subscribe(
			organizationName => {
				tableCell.valueHtml = organizationName;
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}
}
