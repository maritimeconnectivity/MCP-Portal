import {Component, ViewEncapsulation, OnInit, ViewChild} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {FileUploadType, McFileUploader} from "../../../../../theme/components/mcFileUploader/mcFileUploader.component";
import {Doc} from "../../../../../backend-api/service-registry/autogen/model/Doc";
import {Xml} from "../../../../../backend-api/service-registry/autogen/model/Xml";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {
	McFormControlModel,
	McFormControlType
} from "../../../../../theme/components/mcForm/mcFormControlModel";
import {FormGroup, FormControl, FormBuilder} from "@angular/forms";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import OidcAccessTypeEnum = Service.OidcAccessTypeEnum;
import {Observable} from "rxjs";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {SrViewModelService} from "../../../shared/services/sr-view-model.service";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {DesignXmlParser} from "../../../shared/services/design-xml-parser.service";

@Component({
  selector: 'design-update',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-update.html'),
  styles: []
})
export class DesignUpdateComponent implements OnInit {
	@ViewChild('uploadXml')	public fileUploadXml: McFileUploader;
	public hasError: boolean = false;
	public errorText: string;

	public labelValuesParsed:Array<LabelValueModel>;
	private parsedDesign:Design;

  public design: Design;

  public labelValues:Array<LabelValueModel>;
  public captionXml = 'Upload Design XML file';
  public captionDoc = 'Upload Design Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public isLoading = true;

  public isUpdating = false;
  public updateTitle = "Update Design";
  public isFormChanged = false;
  private xml:Xml;
  private doc:Doc;

	private designIdFromRoute:string;
	private versionFromRoute:string;
	private status:string = '';
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private orgsService:OrganizationsService, private viewModelService: SrViewModelService, private formBuilder: FormBuilder, private xmlParser: DesignXmlParser, private mrnHelper: MrnHelperService, private router: Router, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private specificationsService: SpecificationsService, private designService: DesignsService) {
	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadDesign();
		this.updateUI();
	}

	public setFormChanged() {
		var changed = false;
		if (this.xml || this.doc) {
			changed = true;
		} else if (this.status != this.design.status) {
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
			this.isXmlValid(file).subscribe(isValid => {
				this.hasError = !isValid;
				if (isValid) {
					this.xml = file;
				} else {
					this.resetXmlFile();
				}
				this.setFormChanged();
				this.generateForm();
				this.updateUI();
			});
		} else {
			this.hasError = false;
			this.resetXmlFile();
			this.setFormChanged();
			this.generateForm();
			this.updateUI();
		}
	}

	private resetXmlFile() {
		this.status = this.design.status;
		this.xml = null;
		this.fileUploadXml.resetFileSelection();
		this.updateUI();
	}

	private updateUI() {
		if (this.xml) {
			this.parseDesign();
		} else {
			this.parsedDesign = null;
			this.setupLableValuesParsed();
		}
	}

	private isXmlValid(file: Xml) : Observable<boolean> {
		try {
			let specificationMrn = this.xmlParser.getMrnForSpecificationInDesign(file);
			let specificationVersion = this.xmlParser.getVersionForSpecificationInDesign(file);
			let isSpecificationTheSame = this.isSpecificationSameAsBefore(specificationMrn, specificationVersion);
			if (isSpecificationTheSame) {
				let parseValid = this.parseDisplayValues(file);
				return Observable.of(parseValid);
			} else {
				return Observable.create(observer => {
					this.specificationsService.getSpecification(specificationMrn,specificationVersion).subscribe(
						specification => {
							this.design.specifications = [specification];
							let parseValid = this.parseDisplayValues(file);
							observer.next(parseValid);
						},
						err => {
							if (err.status == 404) {
								this.errorText  = "The MRN and version referencing the Specification in the XML, doesn't match any Specifications in Service Registry<BR><BR>"
									+ "Xml-parsed Specification: " + specificationMrn + ", version: " + specificationVersion + "<BR>";
							} else {
								this.errorText  = "Error when trying to validate implemented specification.<BR>";
								// If error isn't "Not found" then another error occured and we can't proceed
								this.notifications.generateNotification('Error when trying to validate implemented specification: ', err.message, MCNotificationType.Error, err);
							}
							observer.next(false);
						}
					);
				});
			}
		} catch ( error ) {
			this.errorText  = "Error in XML.<BR>";
			this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
			return Observable.of(false);
		}
	}

	private parseDesign() {
		this.parsedDesign = null;
		try {
			if (this.xml) {
				var design:Design = _.cloneDeep(this.design);
				// Already contains an XML, so just update the values and not the ID
				design.designAsXml.content = this.xml.content;
				design.designAsXml.contentContentType = this.xml.contentContentType;
				design.designAsXml.name = this.xml.name;
				design.name = this.xmlParser.getName(this.xml);
				design.description = this.xmlParser.getDescription(this.xml);
				design.status = this.xmlParser.getStatus(this.xml);
				design.version = this.xmlParser.getVersion(this.xml);
				this.parsedDesign = design;
			}
		} catch ( error ) {
			this.isUpdating = false;
			this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
			this.resetXmlFile();
		} finally {
			this.setupLableValuesParsed();
		}
	}

	private parseDisplayValues(file:Xml):boolean {
		this.status = this.xmlParser.getStatus(file);
		let parsedMrn = this.xmlParser.getMrn(file);
		let parsedVersion = this.xmlParser.getVersion(file);
		if (parsedMrn != this.design.designId || parsedVersion != this.design.version) {
			this.errorText  = "The MRN and Version in the XML are not the same as the MRN and Version of this Design. If the MRN or Version needs to be changed, please create a NEW Design instead of updating an existing.<BR><BR>"
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
		if (this.parsedDesign) {
			this.orgsService.getOrganizationName(this.design.organizationId).subscribe(
				organizationName => {
					this.labelValuesParsed = this.viewModelService.generateLabelValuesForDesign(this.parsedDesign, organizationName);
				},
				err => {
					this.labelValuesParsed = this.viewModelService.generateLabelValuesForDesign(this.parsedDesign, '');
					this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
				}
			);
		}
	}

	private isSpecificationSameAsBefore(specificationMrn:string, specificationVersion:string) : boolean {
		try {
			let specificationMrnFromDesign = this.xmlParser.getMrnForSpecificationInDesign(this.design.designAsXml);
			let specificationVersionFromDesign = this.xmlParser.getVersionForSpecificationInDesign(this.design.designAsXml);
			let isSameMrn = specificationMrnFromDesign === specificationMrn;
			let isSameVersion = specificationVersionFromDesign === specificationVersion;
			return isSameMrn && isSameVersion;
		} catch ( error ) {
			return false;
		}
	}

	public cancel() {
		this.navigationService.navigateToOrgDesign(this.designIdFromRoute, this.versionFromRoute);
	}

	public update() {
		this.isUpdating = true;
		if (this.xml || this.doc) {
			if (this.xml) {
				this.design = this.parsedDesign;
			}
			if (this.doc) {
				if (this.design.designAsDoc) { // Already contains a Doc, so just update the values and not the ID
					this.design.designAsDoc.filecontent = this.doc.filecontent;
					this.design.designAsDoc.filecontentContentType = this.doc.filecontentContentType;
					this.design.designAsDoc.name = this.doc.name;
				} else {
					this.design.designAsDoc = this.doc;
				}
			}
			this.updateDesign();
		} else {
			this.status = this.updateForm.value.status;
			this.updateStatus();
		}
	}

	private updateStatus() {
		this.notifications.generateNotification("Not Implemented", "Update status only, is sadly not implemented yet", MCNotificationType.Info);
		this.isUpdating = false;
		/*
		 this.designService.updateStatus(this.design, this.status).subscribe(_ => {
		 this.navigationService.navigateToOrgDesign(this.design.designId, this.design.version);
		 },
		 err => {
		 this.isUpdating = false;
		 this.notifications.generateNotification('Error', 'Error when trying to update status', MCNotificationType.Error, err);
		 });
		 */
	}

	private updateDesign() {
		let updateDoc = this.doc != null;
		let updateXml = this.xml != null;
		this.designService.updateDesign(this.design, updateDoc, updateXml).subscribe(_ => {
				this.navigationService.navigateToOrgDesign(this.design.designId, this.design.version);
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update design', MCNotificationType.Error, err);
			});
	}

	private loadDesign() {
		this.designIdFromRoute = this.activatedRoute.snapshot.params['id'];
		this.versionFromRoute = this.activatedRoute.snapshot.queryParams['designVersion'];
		this.designService.getDesign(this.designIdFromRoute, this.versionFromRoute).subscribe(
			design => {
				this.design = design;
				this.status = this.design.status;
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
				this.notifications.generateNotification('Error', 'Error when trying to get design', MCNotificationType.Error, err);
			}
		);
	}

	private generateLabelValues() {
		this.labelValues = [];
		this.labelValues.push({label: 'MRN', valueHtml: this.design.designId});
		this.labelValues.push({label: 'Name', valueHtml: this.design.name});
		this.labelValues.push({label: 'Version', valueHtml: this.design.version});
	}

	private setStatus(status:string) {
		this.status = status;
		this.setFormChanged();
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel;
		let disableStatus = this.xml != null || this.doc != null;
		if (disableStatus) {
			formControlModel = {formGroup: this.updateForm, elementId: 'status', controlType: McFormControlType.Text, labelName: 'Status', placeholder: '', isDisabled: disableStatus};
		} else {
			formControlModel = {formGroup: this.updateForm, elementId: 'status', controlType: McFormControlType.Text, labelName: 'Status', placeholder: ''};
		}
		var formControl = new FormControl(this.status, formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.setStatus(param));
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

	}
}
