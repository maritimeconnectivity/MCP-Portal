import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {FileUploadType} from "../../../../../theme/components/mcFileUploader/mcFileUploader.component";
import {Doc} from "../../../../../backend-api/service-registry/autogen/model/Doc";
import {Xml} from "../../../../../backend-api/service-registry/autogen/model/Xml";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {XmlParserService} from "../../../../../shared/xml-parser.service";

@Component({
  selector: 'specification-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-new.html'),
  styles: []
})
export class SpecificationNewComponent implements OnInit {
  public organization: Organization;
  public captionXml = 'Upload Specification Xml file';
  public captionDoc = 'Upload Specification Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public requiredTextXml = 'You need to upload Xml file';
  public isFormValid = false;

  private xml:Xml;
  private doc:Doc;

  constructor(private xmlParserService: XmlParserService, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private specificationsService: SpecificationsService, private orgService: OrganizationsService) {
    this.organization = {};
  }

  ngOnInit() {
    this.loadMyOrganization();
  }

  public onUploadDoc(file: Doc) {
    if (file) {
      this.doc = file;
    } else {
      this.doc = null;
    }
  }
  public onUploadXml(file: Xml) {
    if (file) {
      this.isFormValid = true;
      this.xml = file;
    } else {
      this.isFormValid = false;
      this.xml = null;
    }
  }

  public cancel() {
    this.navigationService.cancelCreateSpecification();
  }
  public register() {
    try {
      var specification:Specification = {};
      specification.specAsXml = this.xml;
      specification.specAsDoc = this.doc;
      specification.name = this.xmlParserService.getValueFromField('name', this.xml);
      specification.description = this.xmlParserService.getValueFromField('description', this.xml);
      specification.specificationId = this.xmlParserService.getValueFromField('id', this.xml);
      specification.keywords = this.xmlParserService.getValueFromField('keywords', this.xml);
      specification.status = this.xmlParserService.getValueFromField('status', this.xml);
      specification.organisationId = this.organization.mrn;
      specification.version = this.xmlParserService.getValueFromField('version', this.xml);
      this.createSpecification(specification);
    } catch ( error ) {
      this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error);
    }
  }

  private createSpecification(specification:Specification) {
    this.specificationsService.createSpecification(specification).subscribe(
      specification => {
        this.navigationService.navigateToOrgSpecification(specification.specificationId);
      },
      err => {
        this.notifications.generateNotification('Error', 'Error when trying to create specification', MCNotificationType.Error, err);
      }
    );
  }

  private loadMyOrganization() {
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
