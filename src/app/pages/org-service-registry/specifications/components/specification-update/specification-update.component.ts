import {Component, ViewEncapsulation, OnInit, ViewChild} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {FileUploadType, McFileUploader} from "../../../../../theme/components/mcFileUploader/mcFileUploader.component";
import {Doc} from "../../../../../backend-api/service-registry/autogen/model/Doc";
import {Xml} from "../../../../../backend-api/service-registry/autogen/model/Xml";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {
    McFormControlModel, McFormControlModelSelect,
    McFormControlType, SelectModel
} from "../../../../../theme/components/mcForm/mcFormControlModel";
import {FormGroup, FormControl, FormBuilder} from "@angular/forms";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import OidcAccessTypeEnum = Service.OidcAccessTypeEnum;
import {Observable} from "rxjs";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {SrViewModelService} from "../../../shared/services/sr-view-model.service";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {SpecificationXmlParser} from "../../../shared/services/specification-xml-parser.service";

@Component({
  selector: 'specification-update',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-update.html'),
  styles: []
})
export class SpecificationUpdateComponent implements OnInit {
	@ViewChild('uploadXml')	public fileUploadXml: McFileUploader;
	public hasError: boolean = false;
	public errorText: string;

	public labelValuesParsed:Array<LabelValueModel>;
	private parsedSpecification:Specification;

  public specification: Specification;

  public labelValues:Array<LabelValueModel>;
  public captionXml = 'Upload Specification XML file';
  public captionDoc = 'Upload Specification Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public isLoading = true;

  public isUpdating = false;
  public updateTitle = "Update Specification";
  public isFormChanged = false;
  private xml:Xml;
  private doc:Doc;

	private specificationIdFromRoute:string;
	private versionFromRoute:string;
	private status:string = '';
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private orgsService:OrganizationsService, private viewModelService: SrViewModelService, private formBuilder: FormBuilder, private xmlParser: SpecificationXmlParser, private router: Router, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private specificationsService: SpecificationsService) {
	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadSpecification();
		this.updateUI();
	}

	public setFormChanged() {
		var changed = false;
		if (this.xml || this.doc) {
			changed = true;
		} else if (this.status != this.specification.status) {
			changed = true;
		}
		this.isFormChanged = changed;
	}

	public onUploadDoc(file: Doc) {
		this.doc = file;
		this.hasError = false;
		this.setFormChanged();
		this.generateForm();
	}

	public onUploadXml(file: Xml) {
		this.hasError = false;
		if (file) {
			let isValid = this.isXmlValid(file);
			this.hasError = !isValid;
			if (isValid) {
				this.xml = file;
			} else {
				this.resetXmlFile();
			}
		} else {
			this.hasError = false;
			this.resetXmlFile();
		}
		this.setFormChanged();
		this.generateForm();
		this.updateUI();
	}

	private resetXmlFile() {
		this.status = this.specification.status;
		this.xml = null;
		this.fileUploadXml.resetFileSelection();
		this.updateUI();
	}

	private updateUI() {
		if (this.xml) {
			this.parseSpecification();
		} else {
			this.parsedSpecification = null;
			this.setupLableValuesParsed();
		}
	}

	private isXmlValid(file: Xml) : boolean {
		try {
			return this.parseDisplayValues(file);
		} catch ( error ) {
			this.errorText  = "Error in XML.<BR>";
			this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
			return false;
		}
	}

	private parseSpecification() {
		this.parsedSpecification = null;
		try {
			if (this.xml) {
				var specification:Specification = _.cloneDeep(this.specification);
				// Already contains an XML, so just update the values and not the ID
				specification.specAsXml.content = this.xml.content;
				specification.specAsXml.contentContentType = this.xml.contentContentType;
				specification.specAsXml.name = this.xml.name;
				specification.name = this.xmlParser.getName(this.xml);
				specification.description = this.xmlParser.getDescription(this.xml);
				specification.status = this.xmlParser.getStatus(this.xml);
				specification.version = this.xmlParser.getVersion(this.xml);
				this.parsedSpecification = specification;
			}
		} catch ( error ) {
			this.isUpdating = false;
			this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
			this.resetXmlFile();
			this.setFormChanged();
			this.generateForm();
			this.updateUI();
		} finally {
			this.setupLableValuesParsed();
		}
	}

	private parseDisplayValues(file:Xml):boolean {
		this.status = this.xmlParser.getStatus(file);
		let parsedMrn = this.xmlParser.getMrn(file);
		let parsedVersion = this.xmlParser.getVersion(file);
		if (parsedMrn != this.specification.specificationId || parsedVersion != this.specification.version) {
			this.errorText  = "The MRN and Version in the XML are not the same as the MRN and Version of this Specification. If the MRN or Version needs to be changed, please create a NEW Specification instead of updating an existing.<BR><BR>"
				+ "Xml-parsed MRN: " + parsedMrn + "<BR>"
				+ "Xml-parsed Version: " + parsedVersion + "<BR>";
			return false;
		} else {
			return true;
		}
	}

	private setupLableValuesParsed() {
		this.labelValuesParsed = [];
		this.labelValuesParsed.push({label: 'Upload XML', valueHtml: ''});
		if (this.parsedSpecification) {
			this.orgsService.getOrganizationName(this.specification.organizationId).subscribe(
				organizationName => {
					this.labelValuesParsed = this.viewModelService.generateLabelValuesForSpecification(this.parsedSpecification, organizationName);
				},
				err => {
					this.labelValuesParsed = this.viewModelService.generateLabelValuesForSpecification(this.parsedSpecification, '');
					this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
				}
			);
		}
	}

	public cancel() {
		this.navigationService.navigateToOrgSpecification(this.specificationIdFromRoute, this.versionFromRoute);
	}

	public update() {
		this.isUpdating = true;
		if (this.xml || this.doc) {
			if (this.xml) {
				this.specification = this.parsedSpecification;
			}
			if (this.doc) {
				if (this.specification.specAsDoc) { // Already contains a Doc, so just update the values and not the ID
					this.specification.specAsDoc.filecontent = this.doc.filecontent;
					this.specification.specAsDoc.filecontentContentType = this.doc.filecontentContentType;
					this.specification.specAsDoc.name = this.doc.name;
				} else {
					this.specification.specAsDoc = this.doc;
				}
			}
			this.updateSpecification();
		} else {
			this.status = this.updateForm.value.status;
			this.updateStatus();
		}
	}

	private updateStatus() {
		this.specificationsService.updateStatus(this.specification, this.status).subscribe(_ => {
				this.navigationService.navigateToOrgSpecification(this.specification.specificationId, this.specification.version);
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update status of specification', MCNotificationType.Error, err);
			});
	}

	private updateSpecification() {
		let updateDoc = this.doc != null;
		let updateXml = this.xml != null;
		this.specificationsService.updateSpecification(this.specification, updateDoc, updateXml).subscribe(_ => {
				this.navigationService.navigateToOrgSpecification(this.specification.specificationId, this.specification.version);
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update specification', MCNotificationType.Error, err);
			});
	}

	private loadSpecification() {
		this.specificationIdFromRoute = this.activatedRoute.snapshot.params['id'];
		this.versionFromRoute = this.activatedRoute.snapshot.queryParams['specificationVersion'];
		this.specificationsService.getSpecification(this.specificationIdFromRoute, this.versionFromRoute).subscribe(
			specification => {
				this.specification = specification;
				this.status = this.specification.status;
				this.generateLabelValues();
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				// TODO: make this as a general component
				if (err.status == 404) {
					this.router.navigate(['/error404'], {relativeTo: this.activatedRoute, replaceUrl: true })
				}
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get specification', MCNotificationType.Error, err);
			}
		);
	}

	private generateLabelValues() {
		this.labelValues = [];
		this.labelValues.push({label: 'MRN', valueHtml: this.specification.specificationId});
		this.labelValues.push({label: 'Name', valueHtml: this.specification.name});
		this.labelValues.push({label: 'Version', valueHtml: this.specification.version});
	}

	private setStatus(status:string) {
		this.status = status;
		this.setFormChanged();
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModelSelect;
		let disableStatus = this.xml != null || this.doc != null;
		let statusSelect:Array<SelectModel> = [{label: "provisional", value: "provisional", isSelected: false},
			{label: "released", value: "released", isSelected: false}, {label: "deprecated", value: "deprecated", isSelected: false},
			{label: "deleted", value: "deleted", isSelected: false}];
		statusSelect.forEach(status => 	{if (status.value === this.status) status.isSelected = true});
		if (disableStatus) {
			formControlModel = {selectValues: statusSelect, showCheckmark: false, formGroup: this.updateForm, elementId: 'status', controlType: McFormControlType.Select, labelName: 'Status', placeholder: '', isDisabled: disableStatus};
		} else {
			formControlModel = {selectValues: statusSelect, showCheckmark: false, formGroup: this.updateForm, elementId: 'status', controlType: McFormControlType.Select, labelName: 'Status', placeholder: ''};
		}
		var formControl = new FormControl(this.status, formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.setStatus(param));
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);
	}
}
