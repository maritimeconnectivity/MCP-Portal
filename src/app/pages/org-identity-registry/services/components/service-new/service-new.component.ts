import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {
	McFormControlModel, McFormControlType,
	McFormControlModelSelect, SelectModel
} from "../../../../../theme/components/mcForm/mcFormControlModel";
import {IdServicesService} from "../../../../../backend-api/identity-registry/services/id-services.service";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import {ServiceViewModel} from "../../view-models/ServiceViewModel";


@Component({
  selector: 'service-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./service-new.html'),
  styles: []
})
export class ServiceNewComponent implements OnInit {
  public organization: Organization;
	private mrn: string;
	private mrnMask:string;
	private mrnPattern:string;
	private mrnPatternError:string;
	// McForm params
	public isLoading = true;
	public isRegistering = false;
	public registerTitle = "Register Service";
	public registerForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private servicesService: IdServicesService, mrnHelper: MrnHelperService) {
		this.organization = {};
		this.mrnMask = mrnHelper.mrnMaskForInstance();
		this.mrnPattern = mrnHelper.mrnPattern();
		this.mrnPatternError = mrnHelper.mrnPatternError();
		this.mrn = this.mrnMask;
	}

	ngOnInit() {
		this.isRegistering = false;
		this.isLoading = true;
		this.loadMyOrganization();
	}

	public cancel() {
		this.navigationService.cancelCreateService();
	}

	public register() {
		this.isRegistering = true;
		let service:Service = {};
		service.mrn = this.mrn;
		service.name = this.registerForm.value.name;
		service.permissions = this.registerForm.value.permissions;
		service.certDomainName = this.registerForm.value.certDomainName;
		service.oidcRedirectUri = this.registerForm.value.oidcRedirectUri;

		let oidcAccessType = this.registerForm.value.oidcAccessType;
		if (oidcAccessType && oidcAccessType.toLowerCase().indexOf('undefined') < 0) {
			service.oidcAccessType = oidcAccessType;
		}
		this.createService(service);
	}

	private createService(service:Service) {
		this.servicesService.createIdService(service).subscribe(
			service => {
				this.navigationService.navigateToService(service.mrn);
				this.isRegistering = false;
			},
			err => {
				this.isRegistering = false;
				this.notifications.generateNotification('Error', 'Error when trying to create service', MCNotificationType.Error, err);
			}
		);
	}

	private loadMyOrganization() {
		this.orgService.getMyOrganization().subscribe(
			organization => {
				this.organization = organization;
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

	private generateMRN(idValue:string) {
		var mrn = (idValue?idValue:'');
		let valueNoSpaces = mrn.split(' ').join('').toLowerCase();
		this.mrn = this.mrnMask + valueNoSpaces;
		this.registerForm.patchValue({mrn: this.mrn});
	}

	private generateForm() {
		this.registerForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.registerForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.mrn, formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'serviceId', controlType: McFormControlType.Text, labelName: 'Service ID', placeholder: 'Enter Service ID to generate MRN', validator:Validators.required, pattern:this.mrnPattern, errorText:this.mrnPatternError};
		formControl = new FormControl('', formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.generateMRN(param));
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: 'Name is required', validator:Validators.required};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'permissions', controlType: McFormControlType.Text, labelName: 'Permissions', placeholder: ''};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'certDomainName', controlType: McFormControlType.Text, labelName: 'Certificate domain name', placeholder: ''};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'oidcRedirectUri', controlType: McFormControlType.Text, labelName: 'OIDC Redirect URI', placeholder: ''};
		formControl = new FormControl('', formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		let formControlModelSelect:McFormControlModelSelect = {selectValues:this.selectValues(), formGroup: this.registerForm, elementId: 'oidcAccessType', controlType: McFormControlType.Select, labelName: 'Access type', placeholder: ''};
		formControl = new FormControl('', formControlModelSelect.validator);
		this.registerForm.addControl(formControlModelSelect.elementId, formControl);
		this.formControlModels.push(formControlModelSelect);
	}

	private selectValues():Array<SelectModel> {
		let selectValues:Array<SelectModel> = [];
		selectValues.push({value:undefined, label:'Choose access type...'});
		let allOidcTypes = ServiceViewModel.getAllOidcAccessTypes();
		allOidcTypes.forEach(oidcType => {
			selectValues.push({value:oidcType.value, label:oidcType.label});
		});
		return selectValues;
	}
}
