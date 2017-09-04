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
	McFormControlModelSelect, SelectModel, McFormControlModelCheckbox
} from "../../../../../theme/components/mcForm/mcFormControlModel";
import {IdServicesService} from "../../../../../backend-api/identity-registry/services/id-services.service";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import {ServiceViewModel} from "../../view-models/ServiceViewModel";
import {SelectValidator} from "../../../../../theme/validators/select.validator";


@Component({
  selector: 'service-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./service-new.html'),
  styles: []
})
export class ServiceNewComponent implements OnInit {
  public organization: Organization;
  private isPrefilled = false;
	private mrn: string;
	private name: string;
	private instanceVersion: string;
	private mrnMask:string;
	private mrnPattern:string;
	private mrnPatternError:string;
	// McForm params
	private useOIDC:boolean = false;
	public isLoading = true;
	public isRegistering = false;
	public registerTitle = "Register Service";
	public registerForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private servicesService: IdServicesService, mrnHelper: MrnHelperService) {
		this.mrnMask = mrnHelper.mrnMaskForInstance();
		this.mrnPattern = mrnHelper.mrnPattern();
		this.mrnPatternError = mrnHelper.mrnPatternError();
		this.mrn = this.mrnMask;
	}

	ngOnInit() {
		this.isRegistering = false;
		this.isLoading = true;
		let mrn = this.activatedRoute.snapshot.queryParams['mrn'];
		let name = this.activatedRoute.snapshot.queryParams['name'];
		let instanceVersion = this.activatedRoute.snapshot.queryParams['instanceVersion'];
		if (name && mrn && instanceVersion) {
			this.isPrefilled = true;
			this.mrn = mrn;
			this.name = name;
			this.instanceVersion = instanceVersion;
		}
		this.loadMyOrganization();
	}

	public cancel() {
		this.navigationService.cancelCreateService();
	}

	public register() {
		this.isRegistering = true;
		let service:Service = {
			mrn: this.mrn,
			name: this.registerForm.value.name,
			instanceVersion: this.instanceVersion,
			permissions: this.registerForm.value.permissions,
			certDomainName: this.registerForm.value.certDomainName
		};
		if (this.useOIDC) {
			service.oidcRedirectUri = this.registerForm.value.oidcRedirectUri;
			let oidcAccessType = this.registerForm.value.oidcAccessType;
			if (oidcAccessType && oidcAccessType.toLowerCase().indexOf('undefined') < 0) {
				service.oidcAccessType = oidcAccessType;
			}
		} else {
			service.oidcAccessType = null;
			service.oidcRedirectUri = null;
		}
		this.createService(service);
	}

	private createService(service:Service) {
		this.servicesService.createIdService(service).subscribe(
			service => {
				if (this.isPrefilled) {
					this.cancel();
				} else {
					this.navigationService.navigateToService(service.mrn);
				}
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
	private shouldUseOIDC(useOIDC:boolean) {
		this.useOIDC = useOIDC;
		this.generateForm();
	}

	private generateMRN(idValue:string) {
		var mrn = (idValue?idValue:'');
		let valueNoSpaces = mrn.split(' ').join('').toLowerCase();
		this.mrn = this.mrnMask + valueNoSpaces;
		this.registerForm.patchValue({mrn: this.mrn});
	}

	private generateForm() {
		var oldForm = this.registerForm;
		this.registerForm = this.formBuilder.group({});
		if (!oldForm) {
			oldForm = this.registerForm;
		}
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.registerForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.mrn, formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		if (!this.isPrefilled) {
			formControlModel = {formGroup: this.registerForm, elementId: 'serviceId', controlType: McFormControlType.Text, labelName: 'Service ID', placeholder: 'Enter Service ID to generate MRN', validator:Validators.required, pattern:this.mrnPattern, errorText:this.mrnPatternError};
			formControl = new FormControl('', formControlModel.validator);
			formControl.valueChanges.subscribe(param => this.generateMRN(param));
			this.registerForm.addControl(formControlModel.elementId, formControl);
			this.formControlModels.push(formControlModel);
		}


		if (this.isPrefilled) {
			formControlModel = {formGroup: this.registerForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: '', isDisabled: true};
			formControl = new FormControl(this.name, formControlModel.validator);
		} else {
			formControlModel = {formGroup: this.registerForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: 'Name is required', validator:Validators.required};
			formControl = new FormControl('', formControlModel.validator);
		}
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'permissions', controlType: McFormControlType.Text, labelName: 'Permissions', placeholder: ''};
		formControl = new FormControl(oldForm.value.permissions, formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.registerForm, elementId: 'certDomainName', controlType: McFormControlType.Text, labelName: 'Certificate domain name', placeholder: ''};
		formControl = new FormControl(oldForm.value.certDomainName, formControlModel.validator);
		this.registerForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		let formControlModelCheckbox:McFormControlModelCheckbox = {state:this.useOIDC, formGroup: this.registerForm, elementId: 'useOIDC', controlType: McFormControlType.Checkbox, labelName: 'Use OpenID Connect (OIDC)'};
		formControl = new FormControl({value: formControlModelCheckbox.state, disabled: false}, formControlModelCheckbox.validator);
		formControl.valueChanges.subscribe(param => this.shouldUseOIDC(param));
		this.registerForm.addControl(formControlModelCheckbox.elementId, formControl);
		this.formControlModels.push(formControlModelCheckbox);

		if (this.useOIDC) {
			formControlModel = {formGroup: this.registerForm, elementId: 'oidcRedirectUri', controlType: McFormControlType.Text, labelName: 'OIDC Redirect URI', placeholder: '', validator:Validators.required, errorText:'URI is required'};
			formControl = new FormControl('', formControlModel.validator);
			this.registerForm.addControl(formControlModel.elementId, formControl);
			this.formControlModels.push(formControlModel);

			let formControlModelSelect:McFormControlModelSelect = {selectValues:this.selectValues(), formGroup: this.registerForm, elementId: 'oidcAccessType', controlType: McFormControlType.Select, labelName: 'Access type', placeholder: '', validator:SelectValidator.validate, showCheckmark:true};
			formControl = new FormControl('', formControlModelSelect.validator);
			this.registerForm.addControl(formControlModelSelect.elementId, formControl);
			this.formControlModels.push(formControlModelSelect);
		}
	}

	private selectValues():Array<SelectModel> {
		let selectValues:Array<SelectModel> = [];
		selectValues.push({value:undefined, label:'Choose access type...', isSelected: true});
		let allOidcTypes = ServiceViewModel.getAllOidcAccessTypes();
		allOidcTypes.forEach(oidcType => {
			selectValues.push({value:oidcType.value, label:oidcType.label, isSelected: false});
		});
		return selectValues;
	}
}
