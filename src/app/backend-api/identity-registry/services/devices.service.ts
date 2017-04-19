import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Device} from "../autogen/model/Device";
import {DevicecontrollerApi} from "../autogen/api/DevicecontrollerApi";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {PageDevice} from "../autogen/model/PageDevice";
import {SortingHelper} from "../../shared/SortingHelper";

@Injectable()
export class DevicesService implements OnInit {
  constructor(private deviceApi: DevicecontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

	public deleteDevice(deviceMrn:string):Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.deviceApi.deleteDeviceUsingDELETE(orgMrn, deviceMrn);
	}

	public getDevice(deviceMrn:string): Observable<Device> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.deviceApi.getDeviceUsingGET(orgMrn, deviceMrn);
	}

	public getDevices(): Observable<PageDevice> {
		let orgMrn = this.authService.authState.orgMrn;
		let sort = SortingHelper.sortingForDevices();
		// TODO: do paging properly
		return this.deviceApi.getOrganizationDevicesUsingGET(orgMrn, 0, 100, sort);
	}

	public createDevice(device:Device) :Observable<Device>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.deviceApi.createDeviceUsingPOST(orgMrn, device);
	}

	public updateDevice(device:Device) :Observable<Device>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.deviceApi.updateDeviceUsingPUT(orgMrn, device.mrn, device);
	}

	public issueNewCertificate(deviceMrn:string) : Observable<PemCertificate> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.deviceApi.newDeviceCertUsingGET(orgMrn, deviceMrn);
	}

	public revokeCertificate(deviceMrn:string, certificateId:string, certicateRevocation:CertificateRevocation) : Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.deviceApi.revokeDeviceCertUsingPOST(orgMrn, deviceMrn, certificateId, certicateRevocation);
	}
}
