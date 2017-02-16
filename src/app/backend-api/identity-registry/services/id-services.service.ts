import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {ServicecontrollerApi} from "../autogen/api/ServicecontrollerApi";
import {AuthService} from "../../../authentication/services/auth.service";
import {Service} from "../autogen/model/Service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";

@Injectable()
export class IdServicesService implements OnInit {
  constructor(private servicesApi: ServicecontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

	public getIdServiceJbossXml(serviceMrn:string): Observable<string> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.getServiceJbossXmlUsingGET(orgMrn, serviceMrn);
	}

	public getServiceKeycloakJson(serviceMrn:string): Observable<string> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.getServiceKeycloakJsonUsingGET(orgMrn, serviceMrn);
	}

	public deleteIdService(serviceMrn:string):Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.deleteServiceUsingDELETE(orgMrn, serviceMrn);
	}

	public getIdService(serviceMrn:string, orgMrn?:string): Observable<Service> {
  	if (!orgMrn) {
		  orgMrn = this.authService.authState.orgMrn;
	  }
		return this.servicesApi.getServiceUsingGET(orgMrn, serviceMrn);
	}

	public getIdServices(): Observable<Array<Service>> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.getOrganizationServicesUsingGET(orgMrn);
	}

	public issueNewCertificate(serviceMrn:string) : Observable<PemCertificate> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.newServiceCertUsingGET(orgMrn, serviceMrn);
	}

	public revokeCertificate(serviceMrn:string, certificateId:number, certicateRevocation:CertificateRevocation) : Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.revokeServiceCertUsingPOST(orgMrn, serviceMrn, certificateId, certicateRevocation);
	}

	public createIdService(service:Service):Observable<Service>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.createServiceUsingPOST(orgMrn, service);
	}

	public updateIdService(service:Service):Observable<Service>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.updateServiceUsingPUT(orgMrn, service.mrn, service);
	}
}
