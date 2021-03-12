import { Injectable } from "@angular/core";
import { MCNotificationsService, MCNotificationType } from "./mc-notifications.service";
import * as fileSaver from "file-saver";
import * as JSZip from "jszip";
import { Xml } from "../backend-api/service-registry/autogen/model/Xml";
import { Doc } from "../backend-api/service-registry/autogen/model/Doc";
import { CertificateBundle } from "../backend-api/identity-registry/autogen/model/CertificateBundle";

@Injectable()
export class FileHelperService {
  constructor(private notificationService: MCNotificationsService ) {

  }

  public downloadPemCertificate(certificateBundle: CertificateBundle, entityName: string) {
    try {
      let nameNoSpaces = entityName.split(' ').join('_');
      let zip = new JSZip();
      zip.file("Certificate_" + nameNoSpaces + ".pem", certificateBundle.pemCertificate.certificate);
      if (certificateBundle.pemCertificate.privateKey) {
        zip.file("PrivateKey_" + nameNoSpaces + ".pem", certificateBundle.pemCertificate.privateKey);
      }
      if (certificateBundle.pemCertificate.publicKey) {
        zip.file("PublicKey_" + nameNoSpaces + ".pem", certificateBundle.pemCertificate.publicKey);
      }
      if (certificateBundle.keystorePassword) {
        zip.file("KeystorePassword.txt", this.replaceNewLines(certificateBundle.keystorePassword));
      }
      if (certificateBundle.pkcs12Keystore) {
        let p12ByteArray = certificateBundle.pkcs12Keystore;
        let blob = new Blob([p12ByteArray]);
        zip.file("Keystore_" + nameNoSpaces + ".p12", blob);
      }
      zip.generateAsync({type:"blob"}).then(function (content) {
        fileSaver.saveAs(content, "Certificate_" + nameNoSpaces + ".zip");
      });
    } catch ( error ) {
      this.generateError(error);
    }
  }

  public downloadXml(xmlFile:Xml):void {
    if (!xmlFile) {
      this.notificationService.generateNotification('Error', 'No file to download', MCNotificationType.Error);
      return;
    }
    let fileContent = xmlFile.content;

    let fileName = xmlFile.name;
    let fileType = xmlFile.contentContentType;
    this.downloadFile(fileContent, fileType, fileName);
  }

  public downloadDoc(docFile:Doc):void {
    if (!docFile) {
      this.notificationService.generateNotification('Error', 'No file to download', MCNotificationType.Error);
      return;
    }
    // TODO: I belive it is wrong that "content" is an array of strings. Please be wary of this may change in the future
    if (docFile.filecontent.length > 1 && docFile.filecontent.length < 10) {
      this.notificationService.generateNotification('Error', 'File from Service Registry is in the wrong format. ' + docFile.name, MCNotificationType.Error);
      return;
    }
    let fileContent = docFile.filecontent.toString();

    let fileName = docFile.name;
    let fileType = docFile.filecontentContentType;
    this.downloadBase64File(fileContent, fileType, fileName);
  }

  public downloadBase64File(base64Content:string, fileType:string, fileName:string):void {
    try {
      let byteArray = this.convertBase64ToByteArray(base64Content);

      let blob = new Blob([byteArray], {type: fileType});
      fileSaver.saveAs(blob, fileName);
    } catch ( error ) {
      this.generateError(error);
    }
  }

  public downloadFile(content:string, fileType:string, fileName:string):void {
    try {
      let blob = new Blob([content], {type: fileType});
      fileSaver.saveAs(blob, fileName);
    } catch ( error ) {
      this.generateError(error);
    }
  }

  private convertBase64ToByteArray(bas64Content:string):Uint8Array {
    let byteCharacters  = window.atob(bas64Content);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  }

  private generateError(error:any):void {
    this.notificationService.generateNotification('Error', 'Error when trying to download file', MCNotificationType.Error, error);
  }

  private replaceNewLines(stringToReplace:string) {
    var replaceString = "\n";
    if (navigator.appVersion.indexOf("Win")!=-1){
      replaceString = "\r\n";
    }
    return (!stringToReplace) ? '' : stringToReplace.replace(/(\r\n|\n|\r)/gm, "").replace(/(\\n)/gm, replaceString);
  }

}
