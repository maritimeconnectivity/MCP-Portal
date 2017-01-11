import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Device} from "../../../../../backend-api/identity-registry/autogen/model/Device";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {DevicesService} from "../../../../../backend-api/identity-registry/services/devices.service";
import {
	McFormControlModel, McFormControlType
} from "../../../../../theme/components/mcForm/mcFormControlModel";


@Component({
  selector: 'device-update',
  encapsulation: ViewEncapsulation.None,
  template: require('./device-update.html'),
  styles: []
})
export class DeviceUpdateComponent implements OnInit {
	public device: Device;
	// McForm params
	public isLoading = true;
	public isUpdating = false;
	public updateTitle = "Update device";
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private devicesService: DevicesService) {
	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadDevice();
	}

	public cancel() {
		let deviceMrn = (this.device ? this.device.mrn : '');
		this.navigationService.navigateToDevice(deviceMrn);
	}

	public update() {
		this.isUpdating = true;
		this.device.name = this.updateForm.value.name;
		this.device.permissions = this.updateForm.value.permissions;

		this.updateDevice(this.device);
	}

	private updateDevice(device:Device) {
		this.devicesService.updateDevice(device).subscribe(
			_ => {
				this.isUpdating = false;
				this.navigationService.navigateToDevice(this.device.mrn);
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update device', MCNotificationType.Error, err);
			}
		);
	}

	private loadDevice() {
		this.isLoading = true;
		let mrn = this.activatedRoute.snapshot.params['id'];
		this.devicesService.getDevice(mrn).subscribe(
			device => {
				this.device = device;
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the device', MCNotificationType.Error, err);

				this.navigationService.navigateToDevice(mrn);
			}
		);
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.updateForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.device.mrn, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'name', controlType: McFormControlType.Text, labelName: 'Name', placeholder: 'Name is required', validator:Validators.required};
		formControl = new FormControl(this.device.name, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'permissions', controlType: McFormControlType.Text, labelName: 'Permissions', placeholder: ''};
		formControl = new FormControl(this.device.permissions, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);
	}
}
