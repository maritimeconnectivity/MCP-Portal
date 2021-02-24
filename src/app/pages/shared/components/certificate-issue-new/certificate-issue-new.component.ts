import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MCNotificationsService,
  MCNotificationType
} from "../../../../shared/mc-notifications.service";
import { NavigationHelperService, queryKeys } from "../../../../shared/navigation-helper.service";
import { ActivatedRoute } from "@angular/router";
import { CertificateEntityType } from "../../services/certificate-helper.service";
import { CertificatesService } from "../../../../backend-api/identity-registry/services/certificates.service";
import { LabelValueModel } from "../../../../theme/components";
import { FileHelperService } from "../../../../shared/file-helper.service";
import { TOKEN_DELIMITER } from "../../../../shared/app.constants";
import { PemCertificate } from '../../../../backend-api/identity-registry/autogen/model/PemCertificate';
import CertificationRequest from 'pkijs/src/CertificationRequest';
import AttributeTypeAndValue from 'pkijs/src/AttributeTypeAndValue';
import { PrintableString } from 'asn1js';
import { Convert } from 'pvtsutils';

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
    this.fileHelper.downloadPemCertificate(this.pemCertificate, this.entityTitle);
  }

  public issueNew() {
    this.isLoading = true;
    let ecKeyGenParams = {name: "ECDSA", namedCurve: "P-384", typedCurve: ""};
    let keyResult = crypto.subtle.generateKey(ecKeyGenParams, true, ["sign", "verify"]);
    keyResult.then(keyPair => {
      let csr = new CertificationRequest();
      csr.subject.typesAndValues.push(new AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new PrintableString({ value: "Test" })
      }));
      csr.subjectPublicKeyInfo.importKey(keyPair.publicKey).then(() => {
        csr.sign(keyPair.privateKey, "SHA-384").then(() => {
          let csrBytes = csr.toSchema().toBER(false);
          let pemCsr = this.toPem(csrBytes, "CERTIFICATE REQUEST");
          this.certificateService.issueNewCertificate(pemCsr, this.entityType, this.entityMrn).subscribe(
              certificateBundle => {
                crypto.subtle.exportKey("pkcs8", keyPair.privateKey).then(rawPrivKey => {
                  crypto.subtle.exportKey("spki", keyPair.publicKey).then(rawPubKey => {
                    this.pemCertificate = {
                      certificate: certificateBundle,
                      privateKey: this.toPem(rawPrivKey, "PRIVATE KEY"),
                      publicKey: this.toPem(rawPubKey, "PUBLIC KEY")
                    };
                    this.isLoading = false;
                  }, err => {
                    console.error("Public key could not be exported", err);
                    this.isLoading = false;
                  });
                }, err => {
                  console.error("Private key could not be exported", err);
                  this.isLoading = false;
                });
              },
              err => {
                this.isLoading = false;
                this.notificationService.generateNotification('Error', 'Error when trying to issue new certificate', MCNotificationType.Error, err);
              }
          );
        });
      });
    }, err => {
      this.isLoading = false;
      this.notificationService.generateNotification('Error', 'Error when trying to issue new certificate', MCNotificationType.Error, err);
    });
  }

  public cancel() {
    this.navigationHelper.cancelNavigateCertificates();
  }

  private generateLabelValues() {
    this.labelValues = [];
    this.labelValues.push({label: 'Name', valueHtml: this.entityTitle});
    this.labelValues.push({label: 'MRN', valueHtml: this.entityMrn.split(TOKEN_DELIMITER)[0]});
  }

  private toPem(arrayBuffer: ArrayBuffer, type: string) {
    let b64 = Convert.ToBase64(arrayBuffer);
    let finalString = '';
    while(b64.length > 0) {
      finalString += b64.substring(0, 64) + '\n';
      b64 = b64.substring(64);
    }
    return `-----BEGIN ${type}-----\n${finalString}-----END ${type}-----\n`;
  }
}
