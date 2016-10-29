import {Component, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer, HostListener} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../../shared/mc-notifications.service";
import {Xml} from "../../../backend-api/service-registry/autogen/model/Xml";
import {Doc} from "../../../backend-api/service-registry/autogen/model/Doc";
import {layoutSizes} from "../../theme.constants";

export enum FileUploadType {Doc, Xml}

@Component({
  selector: 'mc-file-uploader',
  styles: [require('./mcFileUploader.scss')],
  template: require('./mcFileUploader.html')
})
export class McFileUploader {

  @Input() caption:string = '';

  @Input() fileUploadType:FileUploadType = FileUploadType.Doc;

  @Input() requiredText:string;

  @Output() onUpload: EventEmitter<any> = new EventEmitter();

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;

  public tableClass:string;

  public accept:string = '';

  public chosenFileValue:string = '';

  public hasChosenFile = false;

  constructor(private notificationService: MCNotificationsService) {
    this.calculateNameClass();
  }

  public ngOnInit():void {
    this.accept = (this.fileUploadType === FileUploadType.Xml ? '.xml' : '');
    this.chosenFileValue = this.requiredText;
  }

  public uploadFileListener($event) {
    let files = $event.target.files;

    if (files.length) {
      let file:File = files[0];
      this.chosenFileValue = file.name;
      this.hasChosenFile = true;

      switch (this.fileUploadType) {
        case FileUploadType.Doc: {
          this.handleDocFile(file);
          break;
        }
        case FileUploadType.Xml: {
          this.handleXmlFile(file);
          break;
        }
      }
    } else {
      this.chosenFileValue = this.requiredText;
      this.hasChosenFile = false;
      this.onUpload.emit(null);
    }
  }

  private handleDocFile(file: File) {
    let fileReader:FileReader = new FileReader();
    fileReader.onload = (fileRef) => {
      let data = btoa(fileReader.result);
      // TODO: content should not be Array with next update
      let docFile: Doc = {filecontent: data, filecontentContentType:file.type, mimetype:file.type, name: file.name};
      this.onUpload.emit(docFile);
    }
    fileReader.readAsBinaryString(file);
  }

  private handleXmlFile(file: File) {
    let fileReader:FileReader = new FileReader();
    fileReader.onload = (fileRef) => {
      let data = fileReader.result;
      let xmlFile: Xml = {content: data, contentContentType:file.type, name: file.name};
      this.onUpload.emit(xmlFile);
    }
    fileReader.readAsText(file);
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    this.calculateNameClass();
  }

  private calculateNameClass():void {
    this.tableClass = (this.isWindowToSmall()?'table-label-value-small':'table-label-value');
  }

  private isWindowToSmall():boolean {
    return window.innerWidth <= layoutSizes.resWidthHideSidebar;
  }
}
