import { Component, ViewEncapsulation } from '@angular/core';
import {Device} from "../../../../../backend-api/identity-registry/autogen/model/Device";
import {CertificateEntityType} from "../../../../shared/services/certificate-helper.service";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {ActivatedRoute, Router} from "@angular/router";
import {DevicesService} from "../../../../../backend-api/identity-registry/services/devices.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {AuthService} from "../../../../../authentication/services/auth.service";

@Component({
  selector: 'device-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./device-details.html'),
  styles: []
})
export class DeviceDetailsComponent {
	public labelValues:Array<LabelValueModel>;
	public title:string;
	public isLoading:boolean;
	public device:Device;
	public entityType: CertificateEntityType;
	public certificateTitle: string;
	public showModal:boolean = false;
	public modalDescription:string;
	constructor(private authService: AuthService, private route: ActivatedRoute, private devicesService: DevicesService, private router:Router, private notifications:MCNotificationsService) {

	}

	ngOnInit() {
		this.entityType = CertificateEntityType.Device;
		this.loadDevice();
	}

	private loadDevice() {
		this.isLoading = true;
		let mrn = this.route.snapshot.params['id'];
		this.devicesService.getDevice(mrn).subscribe(
			device => {
				this.device = device;
				this.title = device.name;
				this.isLoading = false;
				this.generateLabelValues();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the device', MCNotificationType.Error, err);
			}
		);
	}

	public generateLabelValues() {
		this.labelValues = [];
		if (this.device) {
			this.labelValues.push({label: 'MRN', valueHtml: this.device.mrn});
			this.labelValues.push({label: 'Name', valueHtml: this.device.name});
			this.labelValues.push({label: 'Permissions', valueHtml: this.device.permissions});
		}
	}

	public isAdmin() {
		return this.authService.authState.isAdmin();
	}

	private delete() {
		this.modalDescription = 'Are you sure you want to delete the device?';
		this.showModal = true;
	}
	public cancelModal() {
		this.showModal = false;
	}

	public deleteForSure() {
		this.isLoading = true;
		this.showModal = false;
		this.devicesService.deleteDevice(this.device.mrn).subscribe(
			() => {
				this.router.navigate(['../'], {relativeTo: this.route });
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete the device', MCNotificationType.Error, err);
			}
		);
	}
}
