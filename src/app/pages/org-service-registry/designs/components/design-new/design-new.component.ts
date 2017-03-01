import {Component, ViewEncapsulation, OnInit, ViewChild} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {FileUploadType, McFileUploader} from "../../../../../theme/components/mcFileUploader/mcFileUploader.component";
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
import {SrViewModelService} from "../../../shared/services/sr-view-model.service";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {DesignXmlParser} from "../../../shared/services/design-xml-parser.service";

@Component({
  selector: 'design-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-new.html'),
  styles: []
})
export class DesignNewComponent implements OnInit {
	@ViewChild('uploadXml')	public fileUploadXml: McFileUploader;
	public hasError: boolean = false;
	public errorText: string;

  public organization: Organization;
  public labelValues:Array<LabelValueModel>;
  public captionXml = 'Upload Design XML file';
  public captionDoc = 'Upload Design Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public requiredTextXml = 'You need to upload XML file';
  public isFormValid = false;
  public isLoading = true;

  public isRegistering = false;
  public registerTitle = "Register Design";
  public registerButtonClass = "btn btn-danger btn-raised";
  public onRegister: Function;

  private specification:Specification;
  private xml:Xml;
  private doc:Doc;

  constructor(private xmlParser: DesignXmlParser, private mrnHelper: MrnHelperService, private activatedRoute: ActivatedRoute, private xmlParserService: XmlParserService, private viewModelService: SrViewModelService, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private designsService: DesignsService, private orgService: OrganizationsService, private specificationsService: SpecificationsService) {
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
	  if (file && this.isXmlValid(file)) {
		  this.xml = file;
	  } else {
		  this.xml = null;
		  this.fileUploadXml.resetFileSelection();
	  }
    this.calculateFormValid();
  }

	private isXmlValid(file: Xml) : boolean {
		try {
			let mrn = this.xmlParser.getMrn(file);
			let isValid = this.mrnHelper.checkMrnForDesign(mrn);
			if (!isValid) {
				this.errorText = "The ID in the XML-file is wrong. The ID is supposed to be an MRN in the following format:<BR>"
					+ this.mrnHelper.mrnMaskForDesign() + "'ID'<BR>"
					+ "'ID'=" + this.mrnHelper.mrnPatternError();
			} else {
				let specificationMrn = this.xmlParser.getMrnForSpecificationInDesign(file);
				let specificationVersion = this.xmlParser.getVersionForSpecificationInDesign(file);
				isValid = (specificationMrn === this.specification.specificationId) && (specificationVersion === this.specification.version);

				if (!isValid) {
					this.errorText  = "The MRN and/or version referencing the Specification in the XML, doesn't match the MRN and/or version of the chosen Specification.<BR><BR>"
						+ "Chosen Specification: " + this.specification.specificationId + ", version: " + this.specification.version + "<BR>"
						+ "Xml-parsed Specification: " + specificationMrn + ", version: " + specificationVersion + "<BR>";
				}
			}
			this.hasError = !isValid;
			return isValid;
		} catch ( error ) {
			this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
			return false;
		}
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
	    design.name = this.xmlParser.getName(this.xml);
	    design.description = this.xmlParser.getDescription(this.xml);
	    design.designId = this.xmlParser.getMrn(this.xml);
	    design.status = this.xmlParser.getStatus(this.xml);
	    design.organizationId = this.organization.mrn;
	    design.version = this.xmlParser.getVersion(this.xml);

      design.specifications = [this.specification];
      this.createDesign(design);
    } catch ( error ) {
      this.isRegistering = false;
      this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
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
        this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
      }
    );
  }

  private loadSpecification() {
    let specificationId = this.activatedRoute.snapshot.queryParams['specificationId'];
    let version = this.activatedRoute.snapshot.queryParams['specificationVersion'];
    this.specificationsService.getSpecification(specificationId, version).subscribe(
      specification => {
        this.specification = specification;
        this.loadOrganizationName();
      },
      err => {
        this.isLoading = false;
        this.notifications.generateNotification('Error', 'Error when trying to get specification', MCNotificationType.Error, err);
      }
    );
  }
	private loadOrganizationName() {
		this.orgService.getOrganizationName(this.specification.organizationId).subscribe(
			organizationName => {
				this.labelValues = this.viewModelService.generateLabelValuesForSpecification(this.specification, organizationName);
				this.calculateFormValid();
				this.isLoading = false;
			},
			err => {
				this.labelValues = this.viewModelService.generateLabelValuesForSpecification(this.specification, '');
				this.calculateFormValid();
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}
}
