import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Device} from "../../../../../backend-api/identity-registry/autogen/model/Device";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {DevicesService} from "../../../../../backend-api/identity-registry/services/devices.service";
import {MrnHelperService} from "../../../../../shared/mrn-helper.service";
import {McFormControlModel, McFormControlType} from "../../../../../theme/components/mcForm/mcFormControlModel";


@Component({
  selector: 'device-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./device-new.html'),
  styles: []
})
export class DeviceNewComponent implements OnInit {
  public organization: Organization;
	private mrn: string;
	private mrnMask:string;
	private mrnPattern:string;
	private mrnPatternError:string;
	// McForm params
	public isLoading = true;
	public isRegistering = false;
	public registerTitle = "Register Device";
	public registerForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private devicesService: DevicesService, mrnHelper: MrnHelperService) {
		this.organization = {};
		this.mrnMask = mrnHelper.mrnMaskForDevice();
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
		this.navigationService.cancelCreateDevice();
	}

	public register() {
		this.isRegistering = true;
		let device:Device = {};
		device.mrn = this.mrn;
		device.name = this.registerForm.value.name;
		device.permissions = this.registerForm.value.permissions;

		this.createDevice(device);
	}

	private createDevice(device:Device) {
		this.devicesService.createDevice(device).subscribe(
			device => {
				this.navigationService.navigateToDevice(device.mrn);
				this.isRegistering = false;
			},
			err => {
				this.isRegistering = false;
				this.notifications.generateNotification('Error', 'Error when trying to create device', MCNotificationType.Error, err);
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

		formControlModel = {formGroup: this.registerForm, elementId: 'deviceId', controlType: McFormControlType.Text, labelName: 'Device ID', placeholder: 'Enter Device ID to generate MRN', validator:Validators.required, pattern:this.mrnPattern, errorText:this.mrnPatternError};
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
	}
}
