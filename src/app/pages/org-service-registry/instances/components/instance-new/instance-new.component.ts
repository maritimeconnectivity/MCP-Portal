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
import {ActivatedRoute} from "@angular/router";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {ViewModelService} from "../../../../shared/services/view-model.service";
import {InstancesService} from "../../../../../backend-api/service-registry/services/instances.service";
import {Instance} from "../../../../../backend-api/service-registry/autogen/model/Instance";
import {IdServicesService} from "../../../../../backend-api/identity-registry/services/id-services.service";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";

@Component({
  selector: 'instance-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./instance-new.html'),
  styles: []
})
export class InstanceNewComponent implements OnInit {
  public organization: Organization;
  public labelValues:Array<LabelValueModel>;
  public captionXml = 'Upload Instance Xml file';
  public captionDoc = 'Upload Instance Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public requiredTextXml = 'You need to upload Xml file';
  public isFormValid = false;
  public isLoading = true;

  public isRegistering = false;
  public registerTitle = "Register Instance";
  public registerButtonClass = "btn btn-danger btn-raised";
  public onRegister: Function;

  private design:Design;
  private xml:Xml;
  private doc:Doc;

  constructor(private activatedRoute: ActivatedRoute, private xmlParserService: XmlParserService, private viewModelService: ViewModelService, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private designsService: DesignsService, private orgService: OrganizationsService, private instancesService: InstancesService, private idServicesService: IdServicesService) {
    this.organization = {};
  }

  ngOnInit() {
    this.onRegister = this.register.bind(this);
    this.isRegistering = false;
    this.isLoading = true;
    this.loadMyOrganization();
    this.loadDesign();
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
    this.navigationService.cancelCreateInstance();
  }

  public register() {
    this.isRegistering = true;
    try {
      var instance:Instance = {};
      instance.instanceAsXml = this.xml;
      instance.instanceAsDoc = this.doc;
      instance.name = this.xmlParserService.getValueFromField('name', this.xml);
      instance.description = this.xmlParserService.getValueFromField('description', this.xml);
      instance.instanceId = this.xmlParserService.getValueFromField('id', this.xml);
      instance.status = this.xmlParserService.getValueFromField('status', this.xml);
      instance.keywords = this.xmlParserService.getValueFromField('keywords', this.xml);
      instance.organizationId = this.organization.mrn;
      instance.version = this.xmlParserService.getValueFromField('version', this.xml);
      instance.designs = [this.design];
      this.createInstance(instance);
    } catch ( error ) {
      this.isRegistering = false;
      this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error);
    }
  }

  private createInstance(instance:Instance) {
    this.instancesService.createInstance(instance).subscribe(
      instanceCreated => {
        this.createIdService(instanceCreated);
        this.isRegistering = false;
      },
      err => {
        this.isRegistering = false;
        this.notifications.generateNotification('Error', 'Error when trying to create instance', MCNotificationType.Error, err);
      }
    );
  }

  private createIdService(instance:Instance) {
    // TODO mere snak nødvendigt før det er på plads
    this.navigationService.navigateToOrgInstance(instance.instanceId, instance.version);
    /*
    let idService:Service = {};

    this.idServicesService.createIdService(idService).subscribe(
      service => {
      },
      err => {
        this.notifications.generateNotification('Error', 'Error when trying to create service instance in Identity Registry', MCNotificationType.Error, err);
      },
      () => {
        this.navigationService.navigateToOrgInstance(instance.instanceId);
      }
    );
    */
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

  private loadDesign() {
    let designId = this.activatedRoute.snapshot.queryParams['designId'];
    let version = this.activatedRoute.snapshot.queryParams['designVersion'];
    this.designsService.getDesign(designId, version).subscribe(
      design => {
        this.design = design;
        this.labelValues = this.viewModelService.generateLabelValuesForDesign(this.design);
        this.calculateFormValid();
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.notifications.generateNotification('Error', 'Error when trying to get design', MCNotificationType.Error);
      }
    );
  }
}
