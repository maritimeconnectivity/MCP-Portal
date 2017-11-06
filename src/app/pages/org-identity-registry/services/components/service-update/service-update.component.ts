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
import {SelectValidator} from "../../../../../theme/validators/select.validator";
import OidcAccessTypeEnum = Service.OidcAccessTypeEnum;
import {isNullOrUndefined} from "util";
import {Vessel} from "../../../../../backend-api/identity-registry/autogen/model/Vessel";
import {VesselsService} from "../../../../../backend-api/identity-registry/services/vessels.service";


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
	private vessel: Vessel;
	private vessels: Array<Vessel>;
	// McForm params
	private useOIDC:boolean = false;
	private useOIDCRedirect:boolean = true;
	private linkToVessel:boolean = false;
	public isLoading = true;
	public isUpdating = false;
	public updateTitle = "Update";
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	// Changed fields
	private permissions:string;
	private certDomainName:string;
	private oidcRedirectUri:string;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private servicesService: IdServicesService, mrnHelper: MrnHelperService, private vesselsService: VesselsService) {

	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadIdService();
	}

	private loadIdService() {
		let mrn = this.activatedRoute.snapshot.params['id'];
		let version = this.activatedRoute.snapshot.queryParams['instanceVersion'];
		this.servicesService.getIdService(mrn, version).subscribe(
			idService => {
				this.idService = idService;
				this.useOIDC = this.idService.oidcAccessType != undefined;
				this.useOIDCRedirect = (this.idService.oidcAccessType && this.idService.oidcAccessType != OidcAccessTypeEnum.BearerOnly);
				this.linkToVessel = !isNullOrUndefined(this.idService.vessel);
				this.permissions = this.idService.permissions;
				this.certDomainName = this.idService.certDomainName;
				this.oidcRedirectUri = this.idService.oidcRedirectUri;
				if (this.linkToVessel) {
					this.vessel = this.idService.vessel;
				}
				this.loadVessels();
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get the service', MCNotificationType.Error, err);
				this.navigationService.navigateToService(mrn);
			}
		);
	}

	private loadVessels() {
		this.vesselsService.getVessels().subscribe(pageVessel => {
			this.vessels = pageVessel.content;
			this.generateForm();
			this.isLoading = false;
		},error => {
			this.notifications.generateNotification('Error', 'Error when trying to get vessels for the service', MCNotificationType.Error, error);
			this.navigationService.navigateToService(this.idService.mrn);
		});
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

		if (this.linkToVessel) {
			this.idService.vessel = this.updateForm.value.vesselSelect;
		} else {
			this.idService.vessel = null;
		}

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

	private shouldLinkToVessel(linkToVessel: boolean) {
		this.linkToVessel = linkToVessel;
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
		formControl = new FormControl(this.permissions, formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.permissions = param);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'certDomainName', controlType: McFormControlType.Text, labelName: 'Certificate domain name', placeholder: ''};
		formControl = new FormControl(this.certDomainName, formControlModel.validator);
		formControl.valueChanges.subscribe(param => this.certDomainName = param);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		let formControlModelCheckbox:McFormControlModelCheckbox = {state:this.useOIDC, formGroup: this.updateForm, elementId: 'useOIDC', controlType: McFormControlType.Checkbox, labelName: 'Use OpenID Connect (OIDC)'};
		formControl = new FormControl({value: "\"" + formControlModelCheckbox.state + "\"", disabled: false}, formControlModelCheckbox.validator);
		formControl.valueChanges.subscribe(param => this.shouldUseOIDC(param));
		this.updateForm.addControl(formControlModelCheckbox.elementId, formControl);
		this.formControlModels.push(formControlModelCheckbox);

		if (this.useOIDC) {
			let selectValues = this.selectValues();
			let formControlModelSelect:McFormControlModelSelect = {selectValues:selectValues, formGroup: this.updateForm, elementId: 'oidcAccessType', controlType: McFormControlType.Select, labelName: 'Access type', placeholder: '', validator:SelectValidator.validate, showCheckmark:true};
			formControl = new FormControl(this.selectedValue(selectValues), formControlModelSelect.validator);
			formControl.valueChanges.subscribe(param => this.shouldUseOIDCRedirect(param));
			this.updateForm.addControl(formControlModelSelect.elementId, formControl);
			this.formControlModels.push(formControlModelSelect);

			if (this.useOIDCRedirect) {
				formControlModel = {formGroup: this.updateForm, elementId: 'oidcRedirectUri', controlType: McFormControlType.Text, labelName: 'OIDC Redirect URI', placeholder: '', validator:Validators.required, errorText:'URI is required'};
				formControl = new FormControl(this.oidcRedirectUri, formControlModel.validator);
				formControl.valueChanges.subscribe(param => this.oidcRedirectUri = param);
				this.updateForm.addControl(formControlModel.elementId, formControl);
				this.formControlModels.push(formControlModel);
			}

		}

    let linkToVesselCheckbox:McFormControlModelCheckbox = {state: this.linkToVessel, formGroup: this.updateForm, elementId: 'linkToVessel', controlType: McFormControlType.Checkbox, labelName: 'Link to a vessel'};
    formControl = new FormControl({value: linkToVesselCheckbox.state, disabled: false}, linkToVesselCheckbox.validator);
    formControl.valueChanges.subscribe(param => this.shouldLinkToVessel(param));
    this.updateForm.addControl(linkToVesselCheckbox.elementId, formControl);
    this.formControlModels.push(linkToVesselCheckbox);

    if (this.linkToVessel) {
        let selectValues = this.vesselSelectValues();
        let vesselSelect:McFormControlModelSelect = {selectValues: selectValues, formGroup: this.updateForm, elementId: 'vesselSelect', controlType: McFormControlType.Select, validator: null, labelName: 'Vessel', placeholder: '', showCheckmark: false, requireGroupValid: false};
        formControl = new FormControl(this.selectedValue(selectValues));
        formControl.valueChanges.subscribe(param => {
            if (param) {
                this.vessel = param;
            }
        });
        this.updateForm.addControl(vesselSelect.elementId, formControl);
        this.formControlModels.push(vesselSelect);
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

    private vesselSelectValues():Array<SelectModel> {
	    let selectValues:Array<SelectModel> = [];
	    var defaultSelected = true;
	    if (this.vessels && this.vessels.length > 0) {
		    this.vessels.forEach(vessel => {
			    let isSelected = false;
			    if (this.vessel) {
				    isSelected = this.vessel.mrn === vessel.mrn;
			    } else {
				    isSelected = defaultSelected;
				    defaultSelected = false;
			    }
			    selectValues.push({value: vessel, label: vessel.name, isSelected: isSelected});
		    });
	    }
	    return selectValues;
    }
}
