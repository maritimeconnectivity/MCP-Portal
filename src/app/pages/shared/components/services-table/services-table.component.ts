import {Component, Input, OnChanges, ViewEncapsulation} from '@angular/core';
import {TableCell, TableHeader, TableRow} from "../../../../theme/components/mcTable/mcTable.component";
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {InstancesService} from "../../../../backend-api/service-registry/services/instances.service";
import {BugReportingService} from "../../../../backend-api/identity-registry/services/bug-reporting.service";
import {BugReport} from "../../../../backend-api/identity-registry/autogen/model/BugReport";
import {Service} from "../../../../backend-api/identity-registry/autogen/model/Service";
import {OrganizationsService} from "../../../../backend-api/identity-registry/services/organizations.service";
import {NavigationHelperService} from "../../../../shared/navigation-helper.service";

@Component({
  selector: 'services-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./services-table.html'),
  styles: []
})
export class ServicesTableComponent implements OnChanges {
  @Input() services: Array<Service>;
  @Input() isLoading: boolean;
	public onRowClick: Function;
  public tableHeaders: Array<TableHeader>;
  public tableRows: Array<TableRow>;
  constructor(private navigationHelperService:NavigationHelperService, private orgsService:OrganizationsService, private notifications: MCNotificationsService, private instancesService: InstancesService, private bugService: BugReportingService) {
  }
  ngOnInit() {
	  this.onRowClick = this.gotoService.bind(this);
  }
  ngOnChanges() {
    if (this.services) {
	    this.loadMyOrganization();
    }
  }

	private loadMyOrganization() {
		this.orgsService.getMyOrganization().subscribe(
			organization => {
				this.generateHeadersAndRows(organization.mrn);
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

  private generateHeadersAndRows(orgMrn:string) {
    var tableHeaders: Array<TableHeader> = [];
    var tableRows: Array<TableRow> = [];

    var tableHeader: TableHeader = {title:'Name', class:''};
    tableHeaders.push(tableHeader);

    tableHeader = {title:'Version', class:'nowrap align-center'};
    tableHeaders.push(tableHeader);

	  tableHeader = {title:'Organization', class:'nowrap'};
	  tableHeaders.push(tableHeader);

    for (let service of this.services) {
      var cells:Array<TableCell> = [];

      var tableCell: TableCell = {valueHtml:service.name, class:'', truncateNumber:250};
      cells.push(tableCell);

      tableCell = {valueHtml:service.instanceVersion, class:'nowrap align-center', truncateNumber:0};
      cells.push(tableCell);

	    tableCell = {valueHtml:'', class:'nowrap', truncateNumber:30};
	    this.setOrganizationCell(tableCell, orgMrn);
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

	private gotoService(index:number) {
  	let mrn = this.services[index].mrn;
  	let version = this.services[index].instanceVersion;
  	this.isLoading = true;
		this.instancesService.getInstance(mrn, version).subscribe(
			instance => {
				this.navigationHelperService.navigateToOrgInstance(mrn, version);
			},
			err => {
				if (err.status == 404) {
					// when using the portal only to register instances, this should never happen. However, if someone uses the SR api only then there might be something missing. We log it for further investigation
					let bugReport:BugReport = {subject:"Missing instance", description:"There is a service in the IR that doesn't exist in the SR.\n\n MRN: " + mrn + ",\nVersion: " + version};
					this.bugService.reportBug(bugReport)
				}
				this.navigationHelperService.navigateToOrgInstance(mrn, version);

			},
		);
	}
}
