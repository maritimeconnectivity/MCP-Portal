import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../authentication/services/auth.service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {Device} from "../autogen/model/Device";
import {DevicecontrollerApi} from "../autogen/api/DevicecontrollerApi";

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

	public getDevices(): Observable<Array<Device>> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.deviceApi.getOrganizationDevicesUsingGET(orgMrn);
	}

  public issueNewCertificate(deviceMrn:string) : Observable<PemCertificate> {
	  let orgMrn = this.authService.authState.orgMrn;
    return this.deviceApi.newDeviceCertUsingGET(orgMrn, deviceMrn);
  }
}
