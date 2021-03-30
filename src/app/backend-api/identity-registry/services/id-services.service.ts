import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {ServicecontrollerApi} from "../autogen/api/ServicecontrollerApi";
import {AuthService} from "../../../authentication/services/auth.service";
import {Service} from "../autogen/model/Service";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {PageService} from "../autogen/model/PageService";
import {PAGE_SIZE_DEFAULT} from "../../../shared/app.constants";
import { CertificateBundle } from '../autogen/model/CertificateBundle';

@Injectable()
export class IdServicesService implements OnInit {
  constructor(private servicesApi: ServicecontrollerApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

	public getIdServiceJbossXml(serviceMrn:string, serviceVersion:string): Observable<string> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.getServiceJbossXmlUsingGET(orgMrn, serviceMrn, serviceVersion);
	}

	public getServiceKeycloakJson(serviceMrn:string, serviceVersion:string): Observable<string> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.getServiceKeycloakJsonUsingGET(orgMrn, serviceMrn, serviceVersion);
	}

	public deleteIdService(serviceMrn:string, serviceVersion:string):Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.deleteServiceUsingDELETE(orgMrn, serviceMrn, serviceVersion);
	}

	public getIdService(serviceMrn:string, serviceVersion:string, orgMrn?:string): Observable<Service> {
  	if (!orgMrn) {
		  orgMrn = this.authService.authState.orgMrn;
	  }
		return this.servicesApi.getServiceVersionUsingGET(orgMrn, serviceMrn, serviceVersion);
	}

	public getIdServices(): Observable<PageService> {
		let orgMrn = this.authService.authState.orgMrn;
		// TODO: do paging properly
		return this.servicesApi.getOrganizationServicesUsingGET(orgMrn, 0, PAGE_SIZE_DEFAULT);
	}

	public issueNewCertificate(csr: string, serviceMrn:string, serviceVersion:string,
							   useServerGeneratedKeys: boolean) : Observable<string | CertificateBundle> {
		let orgMrn = this.authService.authState.orgMrn;
		if (useServerGeneratedKeys) {
			return this.servicesApi.newServiceCertUsingGET(orgMrn, serviceMrn, serviceMrn);
		}
		return this.servicesApi.newServiceCertFromCsrUsingPOST(csr, orgMrn, serviceMrn, serviceVersion);
	}

	public revokeCertificate(serviceMrn:string, serviceVersion:string, certificateId:string, certicateRevocation:CertificateRevocation) : Observable<any> {
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.revokeServiceCertUsingPOST(orgMrn, serviceMrn, serviceVersion, certificateId, certicateRevocation);
	}

	public createIdService(service:Service):Observable<Service>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.createServiceUsingPOST(orgMrn, service);
	}

	public updateIdService(service:Service):Observable<Service>{
		let orgMrn = this.authService.authState.orgMrn;
		return this.servicesApi.updateServiceUsingPUT(orgMrn, service.mrn, service.instanceVersion, service);
	}
}
