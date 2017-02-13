import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {
	McFormControlModel, McFormControlType,
	McFormControlModelSelect, SelectModel, McFormControlModelCheckbox
} from "../../../../../theme/components/mcForm/mcFormControlModel";
import {IdServicesService} from "../../../../../backend-api/identity-registry/services/id-services.service";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import {ServiceViewModel} from "../../view-models/ServiceViewModel";
import {UrlValidator} from "../../../../../theme/validators/url.validator";
import {SelectValidator} from "../../../../../theme/validators/select.validator";
import OidcAccessTypeEnum = Service.OidcAccessTypeEnum;


@Component({
  selector: 'service-update',
  encapsulation: ViewEncapsulation.None,
  template: require('./service-update.html'),
  styles: []
})
export class ServiceUpdateComponent implements OnInit {

	public idService:Service;
	public showModal:boolean = false;
	public modalDescription:string;
	// McForm params
	private useOIDC:boolean = false;
	private useOIDCRedirect:boolean = true;
	public isLoading = true;
	public isUpdating = false;
	public updateTitle = "Update";
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private servicesService: IdServicesService, mrnHelper: MrnHelperService) {

	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadIdService();
	}

	private loadIdService() {
		let mrn = this.activatedRoute.snapshot.params['id'];
		this.servicesService.getIdService(mrn).subscribe(
			idService => {
				this.idService = idService;
				this.useOIDC = this.idService.oidcAccessType;
				this.useOIDCRedirect = (this.idService.oidcAccessType && this.idService.oidcAccessType != OidcAccessTypeEnum.BearerOnly);
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get the service', MCNotificationType.Error, err);

				this.navigationService.navigateToVessel(mrn);
			}
		);
	}

	public cancel() {
		this.navigationService.gobackFromUpdateService();
	}

	public update() {
		if (this.hasActiveCertificate()){
			this.modalDescription = "<b>Certificates</b> will be <b>invalid</b> if you update the service.<br>You need to revoke the certificates and issue new ones.<br><br>Would you still like to update?";
			this.showModal = true;
		} else {
			this.updateForSure();
		}
	}

	private hasActiveCertificate() : boolean {
		if (this.idService.certificates && this.idService.certificates.length > 0) {
			for(let certificate of this.idService.certificates) {
				if (!certificate.revoked) {
					return true;
				}
			}
		}
		return false;
	}

	public cancelModal() {
		this.showModal = false;
	}

	public updateForSure() {
		this.isUpdating = true;
		this.updateValues(true);
		this.updateIdService(this.idService);
	}

	private updateValues(overwriteOidc: boolean) {
		this.idService.name = this.updateForm.value.name;
		this.idService.permissions = this.updateForm.value.permissions;
		this.idService.certDomainName = this.updateForm.value.certDomainName;

		if (overwriteOidc) {
			if (this.useOIDC) {
				if (this.useOIDCRedirect) {
					this.idService.oidcRedirectUri = this.updateForm.value.oidcRedirectUri;
				} else {
					this.idService.oidcRedirectUri = '';
				}
				let oidcAccessType = this.updateForm.value.oidcAccessType;
				if (oidcAccessType && oidcAccessType.toLowerCase().indexOf('undefined') < 0) {
					this.idService.oidcAccessType = oidcAccessType;
				} else {
					this.idService.oidcAccessType = null;
				}
			} else {
					this.idService.oidcAccessType = null;
					this.idService.oidcRedirectUri = null;
					this.idService.oidcClientId = null;
					this.idService.oidcClientSecret = null;
			}
		}
	}

	private updateIdService(service:Service) {
		this.servicesService.updateIdService(service).subscribe(
			_ => {
				this.isUpdating = false;
				this.navigationService.gobackFromUpdateService();
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update service', MCNotificationType.Error, err);
			}
		);
	}

	private shouldUseOIDCRedirect(value:OidcAccessTypeEnum) {
		if (value && this.idService.oidcAccessType != value) {
			this.idService.oidcAccessType = value;
			this.useOIDCRedirect = value != OidcAccessTypeEnum.BearerOnly;
			this.generateForm();
		}
	}

	private shouldUseOIDC(useOIDC:boolean) {
		this.useOIDC = useOIDC;
		this.updateValues(false);
		this.generateForm();
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});

		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.updateForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.idService.mrn, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: '', isDisabled: true};
		formControl = new FormControl(this.idService.name, formControlModel.validator);

		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'permissions', controlType: McFormControlType.Text, labelName: 'Permissions', placeholder: ''};
		formControl = new FormControl(this.idService.permissions, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'certDomainName', controlType: McFormControlType.Text, labelName: 'Certificate domain name', placeholder: ''};
		formControl = new FormControl(this.idService.certDomainName, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		let formControlModelCheckbox:McFormControlModelCheckbox = {state:this.useOIDC, formGroup: this.updateForm, elementId: 'useOIDC', controlType: McFormControlType.Checkbox, labelName: 'Use OpenID Connect (OIDC)'};
		formControl = new FormControl({value: "\"" + formControlModelCheckbox.state + "\"", disabled: false}, formControlModelCheckbox.validator);
		formControl.valueChanges.subscribe(param => this.shouldUseOIDC(param));
		this.updateForm.addControl(formControlModelCheckbox.elementId, formControl);
		this.formControlModels.push(formControlModelCheckbox);

		if (this.useOIDC) {
			let selectValues = this.selectValues();
			let formControlModelSelect:McFormControlModelSelect = {selectValues:selectValues, formGroup: this.updateForm, elementId: 'oidcAccessType', controlType: McFormControlType.Select, labelName: 'Access type', placeholder: '', validator:SelectValidator.validate};
			formControl = new FormControl(this.selectedValue(selectValues), formControlModelSelect.validator);
			formControl.valueChanges.subscribe(param => this.shouldUseOIDCRedirect(param));
			this.updateForm.addControl(formControlModelSelect.elementId, formControl);
			this.formControlModels.push(formControlModelSelect);

			if (this.useOIDCRedirect) {
				formControlModel = {formGroup: this.updateForm, elementId: 'oidcRedirectUri', controlType: McFormControlType.Text, labelName: 'OIDC Redirect URI', placeholder: '', validator:Validators.compose([Validators.required, UrlValidator.validate]), errorText:'URI not valid'};
				formControl = new FormControl(this.idService.oidcRedirectUri, formControlModel.validator);
				this.updateForm.addControl(formControlModel.elementId, formControl);
				this.formControlModels.push(formControlModel);
			}

		}
	}

	private selectedValue(selectValues:Array<SelectModel>):string {
		for(let selectModel of selectValues) {
			if (selectModel.isSelected) {
				return selectModel.value;
			}
		}
		return '';
	}

	private selectValues():Array<SelectModel> {
		let selectValues:Array<SelectModel> = [];
		selectValues.push({value:undefined, label:'Choose access type...', isSelected: this.idService.oidcAccessType == null});
		let allOidcTypes = ServiceViewModel.getAllOidcAccessTypes();
		allOidcTypes.forEach(oidcType => {
			let isSelected = OidcAccessTypeEnum[oidcType.value] === OidcAccessTypeEnum[this.idService.oidcAccessType];
			selectValues.push({value:oidcType.value, label:oidcType.label, isSelected: isSelected});
		});
		return selectValues;
	}
}
