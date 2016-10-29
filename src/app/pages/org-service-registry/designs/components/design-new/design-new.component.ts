import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {FileUploadType} from "../../../../../theme/components/mcFileUploader/mcFileUploader.component";
import {Doc} from "../../../../../backend-api/service-registry/autogen/model/Doc";
import {Xml} from "../../../../../backend-api/service-registry/autogen/model/Xml";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {XmlParserService} from "../../../../../shared/xml-parser.service";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {ActivatedRoute} from "@angular/router";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {ViewModelService} from "../../../../shared/services/view-model.service";

@Component({
  selector: 'design-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-new.html'),
  styles: []
})
export class DesignNewComponent implements OnInit {
  public organization: Organization;
  public labelValues:Array<LabelValueModel>;
  public captionXml = 'Upload Design Xml file';
  public captionDoc = 'Upload Design Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public requiredTextXml = 'You need to upload Xml file';
  public isFormValid = false;
  public isLoading = true;

  public isRegistering = false;
  public registerTitle = "Register Design";
  public registerButtonClass = "btn btn-danger btn-raised";
  public onRegister: Function;

  private specification:Specification;
  private xml:Xml;
  private doc:Doc;

  constructor(private activatedRoute: ActivatedRoute, private xmlParserService: XmlParserService, private viewModelService: ViewModelService, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private designsService: DesignsService, private orgService: OrganizationsService, private specificationsService: SpecificationsService) {
    this.organization = {};
  }

  ngOnInit() {
    this.onRegister = this.register.bind(this);
    this.isRegistering = false;
    this.isLoading = true;
    this.loadMyOrganization();
    this.loadSpecification();
  }

  public calculateFormValid() {
    this.isFormValid = this.xml != null;
  }

  public onUploadDoc(file: Doc) {
    this.doc = file;
    this.calculateFormValid();
  }

  public onUploadXml(file: Xml) {
    this.xml = file;
    this.calculateFormValid();
  }

  public cancel() {
    this.navigationService.cancelCreateDesign();
  }

  public register() {
    this.isRegistering = true;
    try {
      var design:Design = {};
      design.designAsXml = this.xml;
      design.designAsDoc = this.doc;
      design.name = this.xmlParserService.getValueFromField('name', this.xml);
      design.description = this.xmlParserService.getValueFromField('description', this.xml);
      design.designId = this.xmlParserService.getValueFromField('id', this.xml);
      design.status = this.xmlParserService.getValueFromField('status', this.xml);
      design.organizationId = this.organization.mrn;
      design.version = this.xmlParserService.getValueFromField('version', this.xml);
      design.specifications = [this.specification];
      this.createDesign(design);
    } catch ( error ) {
      this.isRegistering = false;
      this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error);
    }
  }

  private createDesign(design:Design) {
    this.designsService.createDesign(design).subscribe(
      design => {
        this.navigationService.navigateToOrgDesign(design.designId, design.version);
        this.isRegistering = false;
      },
      err => {
        this.isRegistering = false;
        this.notifications.generateNotification('Error', 'Error when trying to create design', MCNotificationType.Error, err);
      }
    );
  }

  private loadMyOrganization() {
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
        this.calculateFormValid();
      },
      err => {
        this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error);
      }
    );
  }

  private loadSpecification() {
    let specificationId = this.activatedRoute.snapshot.queryParams['specificationId'];
    let version = this.activatedRoute.snapshot.queryParams['specificationVersion'];
    this.specificationsService.getSpecification(specificationId, version).subscribe(
      specification => {
        this.specification = specification;
        this.labelValues = this.viewModelService.generateLabelValuesForSpecification(this.specification);
        this.calculateFormValid();
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.notifications.generateNotification('Error', 'Error when trying to get specification', MCNotificationType.Error);
      }
    );
  }
}
