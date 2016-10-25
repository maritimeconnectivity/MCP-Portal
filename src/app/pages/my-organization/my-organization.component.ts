import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";
import {OrganizationsService} from "../../backend-api/identity-registry/services/organizations.service";
import {Organization} from "../../backend-api/identity-registry/autogen/model/Organization";
import {AuthService} from "../../authentication/services/auth.service";
import {FileUploadType} from "../../theme/components/mcFileUploader/mcFileUploader.component";
import {Doc} from "../../backend-api/service-registry/autogen/model/Doc";
import {Xml} from "../../backend-api/service-registry/autogen/model/Xml";

@Component({
  selector: 'my-organization',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: require('./my-organization.html')
})
export class MyOrganization implements OnInit {
  private organization: Organization;

/*<mc-file-uploader [caption]="captionDoc" [fileUploadType]="fileTypeDoc" (onUpload)="onUploadDoc()"></mc-file-uploader>*/
  public captionXml = 'Upload Xml file';
  public captionDoc = 'Upload Doc file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;

  public onUploadDoc(file: Doc) {
    console.log("doc: ", file);
  }
  public onUploadXml(file: Xml) {
    console.log("xml: ", file);
  }

  constructor(private notifications: MCNotificationsService, private orgService: OrganizationsService, private authService: AuthService) {
    this.organization = {};
  }

  ngOnInit() {
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
      },
      err => {
        this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error);
      }
    );
  }
}
