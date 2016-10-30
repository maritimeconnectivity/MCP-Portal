import {Component, ViewEncapsulation, Input, HostListener, OnChanges} from '@angular/core';
import {Certificate} from "../../../../backend-api/identity-registry/autogen/model/Certificate";
import {CertificateEntityType, CertificateHelperService} from "../../services/certificate-helper.service";
import {layoutSizes, DATE_FORMAT} from "../../../../theme/theme.constants";
import {AuthService} from "../../../../authentication/services/auth.service";
import {CertificateViewModel} from "../view-models/CertificateViewModel";
import {NavigationHelperService} from "../../../../shared/navigation-helper.service";
import {MCNotificationType, MCNotificationsService} from "../../../../shared/mc-notifications.service";

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

  public newCertificateTitle = "Issue new Certificate";
  public certificateViewModels: Array<CertificateViewModel>;
  public dateFormat = DATE_FORMAT;
  public tableClass:string;
  public onIssueCertificate: Function;

  constructor(private navigationHelper: NavigationHelperService, private authService:AuthService, private certificateHelperService: CertificateHelperService, private notificationService: MCNotificationsService) {
    this.calculateTableClass();
    this.onIssueCertificate = this.issueCertificate.bind(this);
  }

  ngOnChanges() {
    if (this.certificates) {
      this.certificateViewModels = this.certificateHelperService.convertCertificatesToViewModels(this.certificates);
      console.log("before ", this.certificateViewModels);
      this.sortCertificates();
      console.log("after ", this.certificateViewModels);
    }
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
    this.notificationService.generateNotification('Not Implemented', 'Revoke comming soon', MCNotificationType.Info);
  }

  public download(certificate:Certificate) {
    this.notificationService.generateNotification('Not Implemented', 'Download comming soon', MCNotificationType.Info);
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    this.calculateTableClass();
  }

  private calculateTableClass():void {
    this.tableClass = (this.isWindowToSmall()?'certificate-table-short':'certificate-table');
  }

  private isWindowToSmall():boolean {
    return window.innerWidth <= layoutSizes.resWidthCollapseSidebar;
  }
}
