import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {NavigationHelperService, queryKeys} from "../../../../shared/navigation-helper.service";
import {ActivatedRoute} from "@angular/router";
import {CertificateEntityType} from "../../services/certificate-helper.service";
import {AuthService} from "../../../../authentication/services/auth.service";
import {CertificatesService} from "../../../../backend-api/identity-registry/services/certificates.service";
import {PemCertificate} from "../../../../backend-api/identity-registry/autogen/model/PemCertificate";
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";


@Component({
  selector: 'certificate-issue-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./certificate-issue-new.html'),
  styles: []
})
export class CertificateIssueNewComponent implements OnInit {
  public entityType: CertificateEntityType;
  public entityMrn: string;
  public entityTitle: string;
  public isLoading: boolean;
  public pemCertificate: PemCertificate;

  public labelValues:Array<LabelValueModel>;

  constructor(private certificateService: CertificatesService, private route:ActivatedRoute, private navigationHelper: NavigationHelperService, private notificationService: MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = false;
    let entityType = this.route.snapshot.queryParams[queryKeys.ENTITY_TYPE];
    let entityMrn = this.route.snapshot.queryParams[queryKeys.ENTITY_MRN];
    let entityTitle= this.route.snapshot.queryParams[queryKeys.ENTITY_TITLE];
    if (!entityType || !entityMrn || !entityTitle) {
      this.notificationService.generateNotification("Error", "Unresolved state when trying to issue new certificate", MCNotificationType.Error);
      this.navigationHelper.takeMeHome();
    }
    this.entityMrn = entityMrn;
    this.entityTitle = entityTitle;
    this.entityType = +entityType; // +-conversion from string to int
    this.generateLabelValues();
  }

  public zipAndDownload() {
    this.notificationService.generateNotification('Not Implemented', 'Download coming soon', MCNotificationType.Info);
  }

  public issueNew() {
    this.isLoading = true;
    this.certificateService.issueNewCertificate(this.entityType, this.entityMrn).subscribe(
      pemCertificate => {
        this.pemCertificate = pemCertificate;
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.notificationService.generateNotification('Error', 'Error when trying to issue new certificate', MCNotificationType.Error, err);
      }
    );
  }

  public cancel() {
    this.navigationHelper.cancelNavigateCertificates();
  }

  private generateLabelValues() {
    this.labelValues = [];
    this.labelValues.push({label: 'Name', valueHtml: this.entityTitle});
    this.labelValues.push({label: 'MRN', valueHtml: this.entityMrn});
  }
}
