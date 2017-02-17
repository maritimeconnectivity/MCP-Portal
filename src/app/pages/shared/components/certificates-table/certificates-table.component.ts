import {Component, ViewEncapsulation, Input, HostListener, OnChanges} from '@angular/core';
import {Certificate} from "../../../../backend-api/identity-registry/autogen/model/Certificate";
import {CertificateEntityType, CertificateHelperService} from "../../services/certificate-helper.service";
import {layoutSizes, DATE_FORMAT} from "../../../../theme/theme.constants";
import {AuthService} from "../../../../authentication/services/auth.service";
import {CertificateViewModel} from "../../view-models/CertificateViewModel";
import {NavigationHelperService} from "../../../../shared/navigation-helper.service";
import {MCNotificationType, MCNotificationsService} from "../../../../shared/mc-notifications.service";
import {FileHelperService} from "../../../../shared/file-helper.service";
import {PemCertificate} from "../../../../backend-api/identity-registry/autogen/model/PemCertificate";
import {
	TableHeader, TableRow, TableCell,
	TableCellActionButtons, TableActionButton
} from "../../../../theme/components/mcTable/mcTable.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'certificates-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./certificates-table.html'),
  styles: [require('./certificates-table.scss')]
})
export class CertificatesTableComponent implements OnChanges{
  @Input() certificates: Array<Certificate>;
  @Input() certificateEntityType: CertificateEntityType;
  @Input() entityMrn: string;
  @Input() isLoading: boolean;
  @Input() certificateTitle: string;

	public tableHeaders: Array<TableHeader>;
	public tableRows: Array<TableRow>;
  public newCertificateTitle = "Issue new Certificate";
  public certificateViewModels: Array<CertificateViewModel>;
  public tableClass:string;
  public onIssueCertificate: Function;

	public onDownload:Function;

  constructor(private datePipe: DatePipe, private fileHelper: FileHelperService, private navigationHelper: NavigationHelperService, private authService:AuthService, private certificateHelperService: CertificateHelperService, private notificationService: MCNotificationsService) {
    this.onIssueCertificate = this.issueCertificate.bind(this);
  }

	ngOnInit() {
		if (!this.authService.authState.rolesLoaded) {
			this.authService.rolesLoaded.subscribe((mode)=> {
				this.generateHeadersAndRows();
			});
		}
	}

  ngOnChanges() {
    if (this.certificates) {
      this.certificateViewModels = this.certificateHelperService.convertCertificatesToViewModels(this.certificates);
      this.sortCertificates();
	    this.generateHeadersAndRows();
    }
  }
	private generateHeadersAndRows() {
		var tableHeaders: Array<TableHeader> = [];
		var tableRows: Array<TableRow> = [];

		var tableHeader: TableHeader = {title:'Certificate', class:''};
		tableHeaders.push(tableHeader);

		tableHeader = {title:'Valid from', class:'nowrap'};
		tableHeaders.push(tableHeader);

		tableHeader = {title:'Valid to', class:'nowrap'};
		tableHeaders.push(tableHeader);

		tableHeader = {title:'', class:'table-buttons'};
		tableHeaders.push(tableHeader);

		for (let certificate of this.certificateViewModels) {
			var cells:Array<TableCell> = [];

			var tableCell: TableCell = {valueHtml:'Certificate for ' + this.certificateTitle, class:'', truncateNumber:50};
			cells.push(tableCell);

			tableCell = {valueHtml:this.datePipe.transform(certificate.start, DATE_FORMAT), class:'nowrap', truncateNumber:0};
			cells.push(tableCell);

			tableCell = {valueHtml:this.datePipe.transform(certificate.end, DATE_FORMAT), class:'nowrap', truncateNumber:0};
			cells.push(tableCell);

			if (certificate.revoked) {
				tableCell = {valueHtml:'Revoked (' + certificate.revokeReasonText + ')', class:'red-text', truncateNumber:50};
				cells.push(tableCell);
			} else {
				let actionButtons:Array<TableActionButton> = [];
				let actionButton:TableActionButton = {buttonClass: 'btn btn-primary btn-raised btn-sm', name: 'Download certificate', onClick:() => {this.download(certificate)}};
				actionButtons.push(actionButton);
				if (this.isAdmin()) {
					actionButton = {buttonClass: 'btn btn-danger btn-raised btn-sm', name: 'Revoke certificate', onClick:() => {this.revoke(certificate)}};
					actionButtons.push(actionButton);
				}
				let tableCellActionButtons: TableCellActionButtons = {valueHtml:'', class:'table-buttons', truncateNumber:0, actionButtons:actionButtons};
				cells.push(tableCellActionButtons);
			}

			let tableRow: TableRow = {cells: cells};
			tableRows.push(tableRow);
		}

		this.tableHeaders = tableHeaders;
		this.tableRows = tableRows;
	}
  private sortCertificates() {
    // We are sorting with longest due date on top
    this.certificateViewModels.sort((obj1: CertificateViewModel, obj2: CertificateViewModel) => {
      var obj1Time:number;
      var obj2Time:number;
      // Why is this needed??? for some reason sometimes the obj.end is a number and not a Date???
      if (typeof obj1.end === "Date") {
        obj1Time = obj1.end.getTime();
      } else {
        obj1Time = obj1.end;
      }
      if (typeof obj2.end === "Date") {
        obj2Time = obj2.end.getTime();
      } else {
        obj2Time = obj2.end;
      }

      if (obj1.revoked && obj2.revoked) {
        return obj2Time - obj1Time;
      }
      if (obj1.revoked) {
        return 1;
      }
      if (obj2.revoked) {
        return -1;
      }
      return obj2Time - obj1Time;
    });
  }

  public issueCertificate() {
    this.navigationHelper.navigateToIssueNewCertificate(this.certificateEntityType, this.entityMrn, this.certificateTitle);
  }

  public isAdmin():boolean {
    return this.authService.authState.isAdmin();
  }

  public revoke(certificate:Certificate) {
	  this.notificationService.generateNotification('Not Implemented', 'Revoke coming soon', MCNotificationType.Info);
	  // TODO: Waiting for the new IR deploy coming ultimo february
  	//this.navigationHelper.navigateToRevokeCertificate(this.certificateEntityType, this.entityMrn, this.certificateTitle, certificate.id);
  }

  public download(certificate:Certificate) {
    let pemCertificate:PemCertificate = {certificate:certificate.certificate};
    this.fileHelper.downloadPemCertificate(pemCertificate, this.certificateTitle);
  }
}
