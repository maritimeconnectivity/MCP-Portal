import {Component, ViewEncapsulation, OnInit, ViewChild} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {FileUploadType, McFileUploader} from "../../../../../theme/components/mcFileUploader/mcFileUploader.component";
import {Doc} from "../../../../../backend-api/service-registry/autogen/model/Doc";
import {Xml} from "../../../../../backend-api/service-registry/autogen/model/Xml";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {InstancesService} from "../../../../../backend-api/service-registry/services/instances.service";
import {Instance} from "../../../../../backend-api/service-registry/autogen/model/Instance";
import {InstanceXmlParser} from "../../../shared/services/instance-xml-parser.service";
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

@Component({
  selector: 'instance-update',
  encapsulation: ViewEncapsulation.None,
  template: require('./instance-update.html'),
  styles: []
})
export class InstanceUpdateComponent implements OnInit {
	@ViewChild('uploadXml')	public fileUploadXml: McFileUploader;
	public hasError: boolean = false;
	public errorText: string;

  public instance: Instance;

  public labelValues:Array<LabelValueModel>;
  public captionXml = 'Upload Instance XML file';
  public captionDoc = 'Upload Instance Document file';
  public fileTypeXml = FileUploadType.Xml;
  public fileTypeDoc = FileUploadType.Doc;
  public isLoading = true;

  public isUpdating = false;
  public updateTitle = "Update Instance";
  public isFormChanged = false;
  private xml:Xml;
  private doc:Doc;

	private instanceIdFromRoute:string;
	private versionFromRoute:string;
	private mrn:string = '';
	private name:string = '';
	private status:string = '';
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

  constructor(private formBuilder: FormBuilder, private xmlParser: InstanceXmlParser, private mrnHelper: MrnHelperService, private router: Router, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private instancesService: InstancesService, private designService: DesignsService) {
  }

  ngOnInit() {
    this.isUpdating = false;
    this.isLoading = true;
    this.loadInstance();
  }

  public setFormChanged() {
  	var changed = false;
  	if (this.xml || this.doc) {
  		changed = true;
	  } else if (this.status != this.instance.status) {
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
		  });
	  } else {
		  this.hasError = false;
		  this.resetXmlFile();
		  this.setFormChanged();
		  this.generateForm();
	  }
  }

  private resetXmlFile() {
	  this.name = this.instance.name;
	  this.status = this.instance.status;
	  this.xml = null;
	  this.fileUploadXml.resetFileSelection();
  }

	private isXmlValid(file: Xml) : Observable<boolean> {
		try {
			let mrn = this.xmlParser.getMrn(file);
			let isValid = this.mrnHelper.checkMrnForInstance(mrn);
			if (isValid) {
				let designMrn = this.xmlParser.getMrnForDesignInInstance(file);
				let designVersion = this.xmlParser.getVersionForDesignInInstance(file);
				let isDesignTheSame = this.isDesignSameAsBefore(designMrn, designVersion);
				if (isDesignTheSame) {
					let parseValid = this.parseDisplayValues(file);
					return Observable.of(parseValid);
				} else {
					return Observable.create(observer => {
						this.designService.getDesign(designMrn,designVersion).subscribe(
							design => {
								let parseValid = this.parseDisplayValues(file);
								observer.next(parseValid);
							},
							err => {
								if (err.status == 404) {
									this.errorText  = "The MRN and version referencing the Design in the XML, doesn't match any designs in Service Registry<BR><BR>"
										+ "Xml-parsed Design: " + designMrn + ", version: " + designVersion + "<BR>";
								} else {
									this.errorText  = "Error when trying to validate implemented design.<BR>";
									// If error isn't "Not found" then another error occured and we can't proceed
									this.notifications.generateNotification('Error when trying to validate implemented design: ', err.message, MCNotificationType.Error, err);
								}
								observer.next(false);
							}
						);
					});
				}
			} else {
				this.errorText = "The ID in the XML-file is wrong. The ID is supposed to be an MRN in the following format:<BR>"
					+ this.mrnHelper.mrnMaskForInstance() + "'ID'<BR>"
					+ "'ID'=" + this.mrnHelper.mrnPatternError();
				return Observable.of(false);
			}
		} catch ( error ) {
			this.errorText  = "Error in XML.<BR>";
			this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
			return Observable.of(false);
		}
	}

	private parseDisplayValues(file:Xml):boolean {
		this.name = this.xmlParser.getName(file);
		this.status = this.xmlParser.getStatus(file);
		let parsedMrn = this.xmlParser.getMrn(file);
		if (parsedMrn != this.instance.instanceId) {
			this.errorText  = "The MRN in the XML is not the same as the MRN of this Instance. If the MRN needs to be changed, please create a NEW Instance instead of updating an existing.<BR><BR>"
				+ "Xml-parsed MRN: " + parsedMrn + "<BR>";
			return false;
		} else {
			return true;
		}
	}

	private isDesignSameAsBefore(designMrn:string, designVersion:string) : boolean {
  	try {
		  let designMrnFromInstance = this.xmlParser.getMrnForDesignInInstance(this.instance.instanceAsXml);
		  let designVersionFromInstance = this.xmlParser.getVersionForDesignInInstance(this.instance.instanceAsXml);
		  let isSameMrn = designMrnFromInstance === designMrn;
		  let isSameVersion = designVersionFromInstance === designVersion;
		  return isSameMrn && isSameVersion;
	  } catch ( error ) {
  		return false;
	  }
	}

  public cancel() {
    this.navigationService.navigateToOrgInstance(this.instanceIdFromRoute, this.versionFromRoute);
  }

  public update() {
    this.isUpdating = true;
  	if (this.xml || this.doc) {
		  try {
			  if (this.xml) {
				  this.instance.instanceAsXml = this.xml;
				  this.instance.name = this.xmlParser.getName(this.xml);
				  this.instance.description = this.xmlParser.getDescription(this.xml);
				  this.instance.keywords = this.xmlParser.getKeywords(this.xml);
				  this.instance.status = this.xmlParser.getStatus(this.xml);
				  this.instance.version = this.xmlParser.getVersion(this.xml);
				  this.instance.designId = this.xmlParser.getMrnForDesignInInstance(this.xml);
			  }
			  if (this.doc) {
			  	this.instance.instanceAsDoc = this.doc;
			  }
			  this.updateInstance();
		  } catch ( error ) {
			  this.isUpdating = false;
			  this.notifications.generateNotification('Error in XML', error.message, MCNotificationType.Error, error);
		  }
	  } else {
  		this.status = this.updateForm.value.status;
  		this.updateStatus();
	  }
  }

  private updateStatus() {
	  this.instancesService.updateStatus(this.instance, this.status).subscribe(_ => {
			  this.navigationService.navigateToOrgInstance(this.instance.instanceId, this.instance.version);
		  },
		  err => {
			  this.isUpdating = false;
			  this.notifications.generateNotification('Error', 'Error when trying to update status', MCNotificationType.Error, err);
		  });
  }

  private updateInstance() {
		let updateDoc = this.doc != null;
		let updateXml = this.xml != null;
	  this.instancesService.updateInstance(this.instance, updateDoc, updateXml).subscribe(_ => {
			  this.navigationService.navigateToOrgInstance(this.instance.instanceId, this.instance.version);
		  },
		  err => {
			  this.isUpdating = false;
			  this.notifications.generateNotification('Error', 'Error when trying to update instance', MCNotificationType.Error, err);
		  });
  }

	private loadInstance() {
		this.instanceIdFromRoute = this.activatedRoute.snapshot.params['id'];
		this.versionFromRoute = this.activatedRoute.snapshot.queryParams['instanceVersion'];
		this.instancesService.getInstance(this.instanceIdFromRoute, this.versionFromRoute).subscribe(
			instance => {
				this.instance = instance;
				this.status = this.instance.status;
				this.mrn = this.instance.instanceId;
				this.name = this.instance.name;
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
				this.notifications.generateNotification('Error', 'Error when trying to get instance', MCNotificationType.Error, err);
			}
		);
	}

	private generateLabelValues() {
		this.labelValues = [];
		this.labelValues.push({label: 'MRN', valueHtml: this.instance.instanceId});
		this.labelValues.push({label: 'Name', valueHtml: this.instance.name});
	}

	private setStatus(status:string) {
  	this.status = status;
  	this.setFormChanged();
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.updateForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: 'Upload Instance Xml', isDisabled: true};
		var formControl = new FormControl(this.mrn, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: 'Upload Instance XML', isDisabled: true};
		formControl = new FormControl(this.name, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		let disableStatus = this.xml != null || this.doc != null;
		if (disableStatus) {
			formControlModel = {formGroup: this.updateForm, elementId: 'status', controlType: McFormControlType.Text, labelName: 'Status', placeholder: '', isDisabled: disableStatus};
		} else {
			formControlModel = {formGroup: this.updateForm, elementId: 'status', controlType: McFormControlType.Text, labelName: 'Status', placeholder: ''};
		}
		formControl = new FormControl(this.status, formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.setStatus(param));
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

	}
}
