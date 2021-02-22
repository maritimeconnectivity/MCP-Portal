import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SpecificationsService } from "../../../../../backend-api/service-registry/services/specifications.service";
import {
    MCNotificationsService,
    MCNotificationType
} from "../../../../../shared/mc-notifications.service";
import { OrganizationsService } from "../../../../../backend-api/identity-registry/services/organizations.service";
import { Organization } from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {
    FileUploadType,
    McFileUploader
} from "../../../../../theme/components/mcFileUploader/mcFileUploader.component";
import { Doc } from "../../../../../backend-api/service-registry/autogen/model/Doc";
import { Xml } from "../../../../../backend-api/service-registry/autogen/model/Xml";
import { NavigationHelperService } from "../../../../../shared/navigation-helper.service";
import { Specification } from "../../../../../backend-api/service-registry/autogen/model/Specification";
import * as _ from 'lodash';
import { MrnHelperService } from "../../../../../shared/mrn-helper.service";
import { SpecificationXmlParser } from "../../../shared/services/specification-xml-parser.service";
import { LabelValueModel } from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import { SrViewModelService } from "../../../shared/services/sr-view-model.service";

@Component({
  selector: 'specification-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-new.html'),
  styles: []
})
export class SpecificationNewComponent implements OnInit {
	@ViewChild('uploadXml')	public fileUploadXml: McFileUploader;

	public labelValues:Array<LabelValueModel>;
	private parsedSpecification:Specification;

	public hasMrnError: boolean = false;
	public mrnErrorText: string;

  public organization: Organization;
  public captionXml = 'Upload Specification XML file';
  public captionDoc = 'Upload Specification Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public requiredTextXml = 'You need to upload XML file';
  public requiredTextDoc = 'You need to upload a DOCX, ODT or PDF file';
  public isFormValid = false;
  public isLoading = true;

  public isRegistering = false;
  public registerTitle = "Register Specification";
  public registerButtonClass = "btn btn-danger btn-raised";
  public onRegister: Function;

  private xml:Xml;
  private doc:Doc;

  constructor(private viewModelService: SrViewModelService, private xmlParser: SpecificationXmlParser, private mrnHelper: MrnHelperService, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private specificationsService: SpecificationsService, private orgService: OrganizationsService) {
  }

  ngOnInit() {
    this.onRegister = this.register.bind(this);
    this.isRegistering = false;
    this.loadMyOrganization();
    this.calculateFormValid();
    this.updateUI();
  }

  public calculateFormValid() {
    this.isFormValid = this.xml != null;
  }

  public onUploadDoc(file: Doc) {
    this.doc = file;
    this.calculateFormValid();
  }

  public onUploadXml(file: Xml) {
	  if (file && this.isXmlValid(file)) {
	    this.xml = file;
    } else {
		  this.resetXmlFile();
	  }
    this.calculateFormValid();
	  this.updateUI();
  }

  private isXmlValid(file: Xml) : boolean {
	  try {
	  	let mrn = this.xmlParser.getMrn(file);
	  	let isValid = this.mrnHelper.checkMrnForSpecification(mrn);
		  this.hasMrnError = !isValid;
		  if (!isValid) {
		  	this.mrnErrorText = "The ID in the XML-file is wrong. The ID is supposed to be an MRN in the following format:<BR>"
				    + this.mrnHelper.mrnMaskForSpecification() + "'ID'<BR>"
				    + "'ID'=" + this.mrnHelper.mrnPatternError();
		  }
		  return isValid;
	  } catch ( error ) {
		  this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
		  return false;
	  }
  }

  public cancel() {
    this.navigationService.cancelCreateSpecification();
  }

  public register() {
    this.isRegistering = true;
	  this.createSpecification(this.parsedSpecification);
  }

  private createSpecification(specification:Specification) {
    this.specificationsService.createSpecification(specification).subscribe(
      specification => {
        this.isRegistering = false;
        this.navigationService.navigateToOrgSpecification(specification.specificationId, specification.version);
      },
      err => {
        this.isRegistering = false;
        this.notifications.generateNotification('Error', 'Error when trying to create specification', MCNotificationType.Error, err);
      }
    );
  }

  private loadMyOrganization() {
    this.isLoading = true;
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
        this.isLoading = false;
      },
      err => {
        this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error);
        this.isLoading = false;
      }
    );
  }

  private resetXmlFile(){
	  this.xml = null;
	  this.fileUploadXml.resetFileSelection();
  }

  private updateUI() {
	  if (this.xml) {
		  this.parseSpecification();
	  } else {
		  this.parsedSpecification = null;
		  this.setupLableValues();
	  }
  }

  private parseSpecification() {
	  this.parsedSpecification = null;
    try {
		  var specification:Specification = {};
		  specification.specAsXml = _.cloneDeep(this.xml);
		  specification.specAsDoc = this.doc;
		  specification.name = this.xmlParser.getName(this.xml);
		  specification.description = this.xmlParser.getDescription(this.xml);
		  specification.specificationId = this.xmlParser.getMrn(this.xml);
		  specification.keywords = this.xmlParser.getKeywords(this.xml);
		  specification.status = this.xmlParser.getStatus(this.xml);
		  specification.organizationId = this.organization.mrn;
		  specification.version = this.xmlParser.getVersion(this.xml);

	    this.parsedSpecification = specification;
	  } catch ( error ) {
		  this.isRegistering = false;
		  this.resetXmlFile();
		  this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
	  } finally {
	    this.setupLableValues();
	  }
  }

  private setupLableValues() {
	  this.labelValues = [];
	  this.labelValues.push({label: 'Upload XML', valueHtml: ''});
  	if (this.organization && this.parsedSpecification) {
		  this.labelValues = this.viewModelService.generateLabelValuesForSpecification(this.parsedSpecification, this.organization.name);
	  }
  }
}
