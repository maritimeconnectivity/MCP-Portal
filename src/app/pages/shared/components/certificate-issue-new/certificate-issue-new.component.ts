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
import { BitString, BmpString, fromBER, OctetString, PrintableString } from 'asn1js';
import { Convert } from 'pvtsutils';
import PrivateKeyInfo from 'pkijs/build/PrivateKeyInfo';
import Certificate from 'pkijs/build/Certificate';
import PFX from 'pkijs/build/PFX';
import SafeBag from 'pkijs/build/SafeBag';
import AuthenticatedSafe from 'pkijs/build/AuthenticatedSafe';
import CertBag from 'pkijs/build/CertBag';
import CertificationRequest from 'pkijs/build/CertificationRequest';
import AttributeTypeAndValue from 'pkijs/build/AttributeTypeAndValue';
import { CertificateBundle } from '../../../../backend-api/identity-registry/autogen/model/CertificateBundle';
import { stringToArrayBuffer } from 'pvutils';
import SafeContents from 'pkijs/build/SafeContents';
import PKCS8ShroudedKeyBag from 'pkijs/build/PKCS8ShroudedKeyBag';
import Attribute from 'pkijs/build/Attribute';
import { getRandomValues } from 'pkijs/build/common';

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
  public certificateBundle: CertificateBundle;
  public showModal: boolean = false;
  public showIssueModal: boolean = false;
  public modalDescription: string;
  public choiceModalDescription: string;

  public labelValues: Array<LabelValueModel>;

  constructor(private fileHelper: FileHelperService, private certificateService: CertificatesService, private route: ActivatedRoute, private navigationHelper: NavigationHelperService, private notificationService: MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = false;
    let entityType = this.route.snapshot.queryParams[queryKeys.ENTITY_TYPE];
    let entityMrn = this.route.snapshot.queryParams[queryKeys.ENTITY_MRN];
    let entityTitle = this.route.snapshot.queryParams[queryKeys.ENTITY_TITLE];
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
    this.fileHelper.downloadPemCertificate(this.certificateBundle, this.entityTitle);
  }

  public showChoiceModal() {
    this.choiceModalDescription = `You are about to get a new certificate issued. Do you want to 
        generate the key pair for the certificate locally in your browser or do you want to let the 
        MIR API server generate it for you? NOTE that it is strongly recommended 
        to NOT let the server generate the key pair for you due to that in case of a breach of the 
        MIR API server, a malicious third party can potentially take control over your identity 
        by stealing your private key when it is generated.
        <br/>A third option is to generate the key pair and a CSR yourself - an example on how to 
        do this can be found at 
        <a href="https://github.com/maritimeconnectivity/IdentityRegistry#certificate-issuing-by-certificate-signing-request" target="_blank">GitHub</a>`;
    this.showIssueModal = true;
  }

  public showGenerationModal() {
    this.showIssueModal = false;
    let nameNoSpaces = this.entityTitle.split(' ').join('_');
    this.modalDescription = `Do you want to generate a PKCS#12 keystore from the issued certificate?
        <br/>Note that if you choose 'Yes' the generation might take a while and also that the 
        resulting PKCS#12 keystore is NOT compatible with any major operating system or browsers.
        <br/>If you want to have a PKCS#12 keystore that is compatible with most operating systems 
        and browser, you can click 'No' for now and then generate it using OpenSSL with the 
        following command:
        <br/>openssl pkcs12 -export -out keystore.p12 -in Certificate_${nameNoSpaces}.pem -inkey PrivateKey_${nameNoSpaces}`;
    this.showModal = true;
  }

  public issueNewServer() {
    this.showIssueModal = false;
    this.isLoading = true;

  }

  public issueNewLocal(generatePkcs12: boolean) {
    this.showModal = false;
    this.isLoading = true;
    let ecKeyGenParams = {name: 'ECDSA', namedCurve: 'P-384', typedCurve: ''};
    let keyResult = crypto.subtle.generateKey(ecKeyGenParams, true, ['sign', 'verify']);
    keyResult.then(keyPair => {
      let csr = new CertificationRequest();
      csr.subject.typesAndValues.push(new AttributeTypeAndValue({
        type: '2.5.4.3', // Common name
        value: new PrintableString({ value: 'Test' })
      }));
      csr.subjectPublicKeyInfo.importKey(keyPair.publicKey).then(() => {
        csr.sign(keyPair.privateKey, 'SHA-384').then(() => {
          let csrBytes = csr.toSchema().toBER(false);
          let pemCsr = this.toPem(csrBytes, 'CERTIFICATE REQUEST');
          this.certificateService.issueNewCertificate(pemCsr, this.entityType, this.entityMrn)
              .subscribe(certificate => {
                crypto.subtle.exportKey('pkcs8', keyPair.privateKey).then(rawPrivKey => {
                  crypto.subtle.exportKey('spki', keyPair.publicKey).then(rawPubKey => {
                    let privateKey = new PrivateKeyInfo({schema: fromBER(rawPrivKey).result});

                    if (generatePkcs12) {
                      let rawCerts = this.convertCertChain(certificate);
                      let certs = rawCerts.map(cert => new Certificate({schema: fromBER(cert).result}));
                      let password = this.generatePassword();

                      Promise.resolve().then(() => this.generatePKCS12(privateKey, certs, password)).then(result => {
                        this.certificateBundle = {
                          pemCertificate: {
                            privateKey: this.toPem(rawPrivKey, 'PRIVATE KEY'),
                            publicKey: this.toPem(rawPubKey, 'PUBLIC KEY'),
                            certificate: certificate
                          },
                          pkcs12Keystore: result,
                          keystorePassword: password
                        };
                        this.isLoading = false;
                      }, err => {
                        console.error('PKCS12 keystore could not be generated', err);
                        this.isLoading = false;
                      });
                    } else {
                      this.certificateBundle = {
                        pemCertificate: {
                          privateKey: this.toPem(rawPrivKey, 'PRIVATE KEY'),
                          publicKey: this.toPem(rawPubKey, 'PUBLIC KEY'),
                          certificate: certificate
                        }
                      };
                      this.isLoading = false;
                    }
                  }, err => {
                    console.error('Public key could not be exported', err);
                    this.isLoading = false;
                  });
                }, err => {
                  console.error('Private key could not be exported', err);
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

  private toPem(arrayBuffer: ArrayBuffer, type: string): string {
    let b64 = Convert.ToBase64(arrayBuffer);
    let finalString = '';
    while (b64.length > 0) {
      finalString += b64.substring(0, 64) + '\n';
      b64 = b64.substring(64);
    }
    return `-----BEGIN ${type}-----\n${finalString}-----END ${type}-----\n`;
  }

  private convertCertChain(pemCertChain: string): Array<ArrayBuffer> {
    let certs = pemCertChain.split(/-----END CERTIFICATE-----/);
    certs = certs.slice(0, certs.length - 1);
    let tmp = certs.map(c => c.split(/-----BEGIN CERTIFICATE-----/)[1].replace(/\n/mg, ''));
    return tmp.map(c => Convert.FromBase64(c));
  }

  private generatePassword(): string {
    let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_^';
    let values = new Uint32Array(26);
    crypto.getRandomValues(values);
    let result = '';
    for (let i = 0; i < values.length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  private generatePKCS12(privateKey: PrivateKeyInfo, certs: Array<Certificate>, password: string): Promise<ArrayBuffer> {
    const keyLocalIDBuffer = new ArrayBuffer(4);
    const keyLocalIDView = new Uint8Array(keyLocalIDBuffer);
    getRandomValues(keyLocalIDView);

    const certLocalIDBuffer = new ArrayBuffer(4);
    const certLocalIDView = new Uint8Array(certLocalIDBuffer);
    getRandomValues(certLocalIDView);

    const caCertLocalIDBuffer = new ArrayBuffer(4);
    const caCertLocalIDView = new Uint8Array(caCertLocalIDBuffer);
    getRandomValues(caCertLocalIDView);

    const bitArray = new ArrayBuffer(1);
    const bitView = new Uint8Array(bitArray);

    // tslint:disable-next-line:no-bitwise
    bitView[0] |= 0x80;

    const keyUsage = new BitString({
      valueHex: bitArray,
      unusedBits: 7
    });

    privateKey.attributes = [
      new Attribute({
        type: '2.5.29.15',
        values: [
          keyUsage
        ]
      })
    ];

    let certCn = '';
    certs[0].subject.typesAndValues.forEach(t => {
      if (t.type === '2.5.4.3') {
        certCn = t.value.valueBlock.value;
      }
    });

    let caCn = '';
    certs[1].subject.typesAndValues.forEach(t => {
      if (t.type === '2.5.4.3') {
        caCn = t.value.valueBlock.value;
      }
    });

    const pfx = new PFX({
      parsedValue: {
        integrityMode: 0,
        authenticatedSafe: new AuthenticatedSafe({
          parsedValue: {
            safeContents: [
              {
                privacyMode: 0,
                value: new SafeContents({
                  safeBags: [
                      new SafeBag({
                        bagId: '1.2.840.113549.1.12.10.1.2',
                        bagValue: new PKCS8ShroudedKeyBag({
                          parsedValue: privateKey
                        }),
                        bagAttributes: [
                            new Attribute({
                              type: '1.2.840.113549.1.9.20', // friendlyName
                              values: [
                                  new BmpString({ value: 'PKCS8ShroudedKeyBag from PKIjs' })
                              ]
                            }),
                            new Attribute({
                              type: '1.2.840.113549.1.9.21', // localKeyID
                              values: [
                                  new OctetString({ valueHex: keyLocalIDBuffer })
                              ]
                            }),
                            new Attribute({
                              type: '1.3.6.1.4.1.311.17.1', // pkcs12KeyProviderNameAttr
                              values: [
                                  new BmpString({ value: 'MCP using https://pkijs.org/' })
                              ]
                            })
                        ]
                      })
                  ]
                })
              },
              {
                privacyMode: 1,
                value: new SafeContents({
                  safeBags: [
                      new SafeBag({
                        bagId: '1.2.840.113549.1.12.10.1.3',
                        bagValue: new CertBag({
                          parsedValue: certs[0]
                        }),
                        bagAttributes: [
                            new Attribute({
                              type: '1.2.840.113549.1.9.20', // friendlyName
                              values: [
                                  new BmpString({ value: certCn })
                              ]
                            }),
                            new Attribute({
                              type: '1.2.840.113549.1.9.21', // localKeyID
                              values: [
                                  new OctetString({ valueHex: certLocalIDBuffer })
                              ]
                            }),
                            new Attribute({
                              type: '1.3.6.1.4.1.311.17.1', // pkcs12KeyProviderNameAttr
                              values: [
                                  new BmpString({ value: 'MCP using https://pkijs.org/' })
                              ]
                            })
                        ]
                      }),
                      new SafeBag({
                        bagId: '1.2.840.113549.1.12.10.1.3',
                        bagValue: new CertBag({
                          parsedValue: certs[1]
                        }),
                        bagAttributes: [
                          new Attribute({
                            type: '1.2.840.113549.1.9.20', // friendlyName
                            values: [
                              new BmpString({ value: caCn })
                            ]
                          }),
                          new Attribute({
                            type: '1.2.840.113549.1.9.21', // localKeyID
                            values: [
                              new OctetString({ valueHex: caCertLocalIDBuffer })
                            ]
                          }),
                          new Attribute({
                            type: '1.3.6.1.4.1.311.17.1', // pkcs12KeyProviderNameAttr
                            values: [
                              new BmpString({ value: 'MCP using https://pkijs.org/' })
                            ]
                          })
                        ]
                      })
                  ]
                })
              }
            ]
          }
        })
      }
    });

    let passwordConverted = stringToArrayBuffer(password);
    let sequence = Promise.resolve();

    sequence = sequence.then(
        () => pfx.parsedValue.authenticatedSafe.parsedValue.safeContents[0].value.safeBags[0].bagValue.makeInternalValues({
          password: passwordConverted,
          contentEncryptionAlgorithm: {
            name: 'AES-CBC', // OpenSSL can handle AES-CBC only
            length: 128
          },
          hmacHashAlgorithm: 'SHA-256',
          iterationCount: 100000
        })
    );

    sequence = sequence.then(
        () => pfx.parsedValue.authenticatedSafe.makeInternalValues({
          safeContents: [
            {
              // Empty parameters for first SafeContent since "No Privacy" protection mode there
            },
            {
              password: passwordConverted,
              contentEncryptionAlgorithm: {
                name: 'AES-CBC', // OpenSSL can handle AES-CBC only
                length: 128
              },
              hmacHashAlgorithm: 'SHA-256',
              iterationCount: 100000
            }
          ]
        })
    );

    sequence = sequence.then(
        () => pfx.makeInternalValues({
          password: passwordConverted,
          iterations: 100000,
          pbkdf2HashAlgorithm: 'SHA-256',
          hmacHashAlgorithm: 'SHA-256'
        })
    );

    sequence = sequence.then(() => pfx.toSchema().toBER(false));

    return sequence;
  }
}
