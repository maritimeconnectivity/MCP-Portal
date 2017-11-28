import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {NavigationHelperService, queryKeys} from "../../../../shared/navigation-helper.service";
import {ActivatedRoute} from "@angular/router";
import {CertificateEntityType} from "../../services/certificate-helper.service";
import {CertificatesService} from "../../../../backend-api/identity-registry/services/certificates.service";
import {PemCertificate} from "../../../../backend-api/identity-registry/autogen/model/PemCertificate";
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {FileHelperService} from "../../../../shared/file-helper.service";
import {CertificateBundle} from "../../../../backend-api/identity-registry/autogen/model/CertificateBundle";
import {TOKEN_DELIMITER} from "../../../../shared/app.constants";


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
  public certificate: CertificateBundle;

  public labelValues:Array<LabelValueModel>;

  constructor(private fileHelper: FileHelperService, private certificateService: CertificatesService, private route:ActivatedRoute, private navigationHelper: NavigationHelperService, private notificationService: MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = false;
    let entityType = this.route.snapshot.queryParams[queryKeys.ENTITY_TYPE];
    let entityMrn = this.route.snapshot.queryParams[queryKeys.ENTITY_MRN];
    let entityTitle= this.route.snapshot.queryParams[queryKeys.ENTITY_TITLE];
    if (entityType == null || !entityMrn || !entityTitle) {
      this.notificationService.generateNotification("Error", "Unresolved state when trying to issue new certificate", MCNotificationType.Error);
      this.navigationHelper.takeMeHome();
    }
    this.entityMrn = entityMrn;
    this.entityTitle = entityTitle;
    this.entityType = +entityType; // +-conversion from string to int
    this.generateLabelValues();
  }

  public zipAndDownload() {
    this.fileHelper.downloadPemCertificate(this.certificate, this.entityTitle);
  }

  public issueNew() {
    this.isLoading = true;
    this.certificateService.issueNewCertificate(this.entityType, this.entityMrn).subscribe(
      certificateBundle => {
        this.certificate = certificateBundle;
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
    this.labelValues.push({label: 'MRN', valueHtml: this.entityMrn.split(TOKEN_DELIMITER)[0]});
  }
}
