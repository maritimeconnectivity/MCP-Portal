import { Component, ViewEncapsulation } from '@angular/core';
import {Device} from "../../../../../backend-api/identity-registry/autogen/model/Device";
import {CertificateEntityType} from "../../../../shared/services/certificate-helper.service";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {ActivatedRoute} from "@angular/router";
import {DevicesService} from "../../../../../backend-api/identity-registry/services/devices.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";

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
	constructor(private route: ActivatedRoute, private devicesService: DevicesService, private notifications:MCNotificationsService) {

	}

	ngOnInit() {
		this.entityType = CertificateEntityType.Device;
		this.loadVessel();
	}

	private loadVessel() {
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
}
