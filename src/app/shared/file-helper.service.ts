import {Injectable} from "@angular/core";
import {MCNotificationsService, MCNotificationType} from "./mc-notifications.service";
import * as fileSaver  from "file-saver";
import {Xml} from "../backend-api/service-registry/autogen/model/Xml";
import {Doc} from "../backend-api/service-registry/autogen/model/Doc";

@Injectable()
export class FileHelperService {
  constructor(private notificationService: MCNotificationsService ) {

  }

  public downloadXml(xmlFile:Xml):void {
    if (!xmlFile) {
      this.notificationService.generateNotification({title:'Error', message:'No file to download', type:MCNotificationType.Error});
      return;
    }
    // TODO: I belive it is wrong that "content" is an array of strings. Please be wary of this may change in the future
    if (xmlFile.content.length > 1 && xmlFile.content.length < 10) {
      this.notificationService.generateNotification({title:'Error', message:'Xml file from Service Registry is in the wrong format. Please file a bug report stating which file you were trying to download', type:MCNotificationType.Error});
      return;
    }
    let fileContent = xmlFile.content.toString();

    let fileName = xmlFile.name;
    let fileType = xmlFile.contentContentType;
    // TODO: this should change to non-base64 string with next service-registry update
    this.downloadBase64File(fileContent, fileType, fileName);
  }

  public downloadDoc(docFile:Doc):void {
    if (!docFile) {
      this.notificationService.generateNotification({title:'Error', message:'No file to download', type:MCNotificationType.Error});
      return;
    }
    // TODO: I belive it is wrong that "content" is an array of strings. Please be wary of this may change in the future
    if (docFile.filecontent.length > 1 && docFile.filecontent.length < 10) {
      this.notificationService.generateNotification({title:'Error', message:'Xml file from Service Registry is in the wrong format. Please file a bug report stating which file you were trying to download', type:MCNotificationType.Error});
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
    this.notificationService.generateNotification({title:'Error', message:'Error when trying to download file', type:MCNotificationType.Error, originalError:error});
  }

}
