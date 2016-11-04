import {Component, ViewEncapsulation, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {
	TableHeader, TableRow, TableCell,
	TableActionButton, TableCellActionButtons
} from "../../../../../theme/components/mcTable/mcTable.component";

@Component({
  selector: 'approve-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./approve-list.html'),
  styles: []
})
export class ApproveListComponent implements OnInit {
	public showModal:boolean = false;
	public modalDescription:string;

	private organizations:Array<Organization>;
  public isLoading: boolean;
	public onGotoDetails: Function;
	public tableHeaders: Array<TableHeader>;
	public tableRows: Array<TableRow>;
  constructor(private router:Router, private route:ActivatedRoute, private orgService: OrganizationsService, private notifications:MCNotificationsService) {

  }

  ngOnInit() {
    this.isLoading = true;
	  this.onGotoDetails = this.gotoInstance.bind(this);
    this.loadOrganizations();
  }

	private loadOrganizations() {
		this.orgService.getUnapprovedOrganizations().subscribe(
			organizations => {
				this.organizations = organizations;
				this.generateHeadersAndRows();
				this.isLoading = false;
			},
			err => {
		    this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organizations', MCNotificationType.Error, err);
			}
		);
	}

	private gotoInstance(index:number) {
		this.router.navigate([this.organizations[index].mrn], {relativeTo: this.route });
	}

	private generateHeadersAndRows() {
		var tableHeaders: Array<TableHeader> = [];
		var tableRows: Array<TableRow> = [];

		var tableHeader: TableHeader = {title:'Name', class:''};
		tableHeaders.push(tableHeader);

		tableHeader = {title:'Country', class:'nowrap'};
		tableHeaders.push(tableHeader);

		tableHeader = {title:'Address', class:'nowrap'};
		tableHeaders.push(tableHeader);

		tableHeader = {title:'', class:'table-buttons'};
		tableHeaders.push(tableHeader);

		for (let organization of this.organizations) {
			var cells:Array<TableCell> = [];

			var tableCell: TableCell = {valueHtml:organization.name, class:'', truncateNumber:70};
			cells.push(tableCell);

			tableCell = {valueHtml:organization.country, class:'nowrap', truncateNumber:0};
			cells.push(tableCell);

			tableCell = {valueHtml:organization.address, class:'table-description', truncateNumber:140};
			cells.push(tableCell);

			let actionButtons:Array<TableActionButton> = [];
			let actionButton:TableActionButton = {buttonClass: 'btn btn btn-success btn-raised btn-sm', name: 'Approve', onClick:() => {this.approve(organization)}};
			actionButtons.push(actionButton);

			actionButton = {buttonClass: 'btn btn-danger btn-raised btn-sm', name: 'Delete', onClick:() => {this.delete(organization)}};
			actionButtons.push(actionButton);

			let tableCellActionButtons: TableCellActionButtons = {valueHtml:'', class:'nowrap table-buttons', truncateNumber:0, actionButtons:actionButtons};
			cells.push(tableCellActionButtons);


			let tableRow: TableRow = {cells: cells};
			tableRows.push(tableRow);
		}

		this.tableHeaders = tableHeaders;
		this.tableRows = tableRows;
	}

	private approve(organization:Organization) {
		console.log("Approve: ", organization);
	}

	private organizationToDelete:Organization;
	private delete(organization:Organization) {
		this.modalDescription = 'Do you want to delete ' + organization.name;
		this.organizationToDelete = organization;
		this.showModal = true;
	}
	public cancelModal() {
		this.showModal = false;
	}

	private deleteForSure(organization:Organization) {
		this.isLoading = true;
		this.showModal = false;
		this.orgService.deleteOrganization(this.organizationToDelete.mrn).subscribe(
			() => {
				this.loadOrganizations();
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to delete organization', MCNotificationType.Error, err);
			}
		);
	}
}
