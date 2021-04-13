import { Injectable, OnInit } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { CertificateEntityType } from "../../../pages/shared/services/certificate-helper.service";
import { OrganizationsService } from "./organizations.service";
import { DevicesService } from "./devices.service";
import { IdServicesService } from "./id-services.service";
import { UsersService } from "./users.service";
import { VesselsService } from "./vessels.service";
import { CertificateRevocation } from "../autogen/model/CertificateRevocation";
import { TOKEN_DELIMITER } from "../../../shared/app.constants";
import { CertificateBundle } from '../autogen/model/CertificateBundle';

@Injectable()
export class CertificatesService implements OnInit {

  constructor(private organizationsService: OrganizationsService, private devicesService: DevicesService, private servicesService: IdServicesService, private usersService: UsersService, private vesselsService: VesselsService) {
  }

  ngOnInit() {

  }

	public issueNewCertificate(csr: string, entityType: CertificateEntityType, entityMrn: string,
							   useServerGeneratedKeys: boolean): Observable<string | CertificateBundle> {
		if (entityType == null || !entityMrn) { // We lost our state data somehow???
			throw new Error('Internal state lost');
		}
		return Observable.create(observer => {
			switch (entityType) {
				case CertificateEntityType.Organization: {
					this.issueNewCertificateForOrganization(csr, useServerGeneratedKeys, observer);
					break;
				}
				case CertificateEntityType.Device: {
					this.issueNewCertificateForDevice(csr, entityMrn, useServerGeneratedKeys, observer);
					break;
				}
				case CertificateEntityType.Service: {
					this.issueNewCertificateForService(csr, entityMrn, useServerGeneratedKeys, observer);
					break;
				}
				case CertificateEntityType.User: {
					this.issueNewCertificateForUser(csr, entityMrn, useServerGeneratedKeys, observer);
					break;
				}
				case CertificateEntityType.Vessel: {
					this.issueNewCertificateForVessel(csr, entityMrn, useServerGeneratedKeys, observer);
					break;
				}
			}
		});
	}

	public revokeCertificate(entityType: CertificateEntityType, entityMrn:string, certificateId:string, certificateRevocation:CertificateRevocation) : Observable<any> {
		if (entityType == null || !entityMrn) { // We lost our state data somehow???
			throw new Error('Internal state lost');
		}

		return Observable.create(observer => {
			switch (entityType) {
				case CertificateEntityType.Organization: {
					this.revokeCertificateForOrganization(certificateId, certificateRevocation, observer);
					break;
				}
				case CertificateEntityType.Device: {
					this.revokeCertificateForDevice(entityMrn, certificateId, certificateRevocation, observer);
					break;
				}
				case CertificateEntityType.Service: {
					this.revokeCertificateForService(entityMrn, certificateId, certificateRevocation, observer);
					break;
				}
				case CertificateEntityType.User: {
					this.revokeCertificateForUser(entityMrn, certificateId, certificateRevocation, observer);
					break;
				}
				case CertificateEntityType.Vessel: {
					this.revokeCertificateForVessel(entityMrn, certificateId, certificateRevocation, observer);
					break;
				}
			}
		});
	}

  private issueNewCertificateForOrganization(csr: string, useServerGeneratedKeys: boolean,
											 observer: Observer<string | CertificateBundle>) {
    this.organizationsService.issueNewCertificate(csr, useServerGeneratedKeys).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForOrganization(certificateId:string, certificateRevocation:CertificateRevocation, observer: Observer<any>) {
		this.organizationsService.revokeCertificate(certificateId, certificateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}

  private issueNewCertificateForDevice(csr: string, deviceMrn: string, useServerGeneratedKeys: boolean,
									   observer: Observer<string | CertificateBundle>) {
    this.devicesService.issueNewCertificate(csr, deviceMrn, useServerGeneratedKeys).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForDevice(deviceMrn: string, certificateId:string, certificateRevocation:CertificateRevocation, observer: Observer<any>) {
		this.devicesService.revokeCertificate(deviceMrn, certificateId, certificateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}

  private issueNewCertificateForService(csr: string, serviceMrn: string, useServerGeneratedKeys: boolean,
										observer: Observer<string | CertificateBundle>) {
	let serviceMrnAndVersion = serviceMrn.split(TOKEN_DELIMITER);
	this.servicesService.issueNewCertificate(csr, serviceMrnAndVersion[0], serviceMrnAndVersion[1],
		useServerGeneratedKeys).subscribe(
	  pemCertificate => {
		observer.next(pemCertificate);
	  },
	  err => {
		observer.error(err);
	  }
	);
  }

	private revokeCertificateForService(serviceMrn: string, certificateId:string, certificateRevocation:CertificateRevocation, observer: Observer<any>) {
  		let serviceMrnAndVersion = serviceMrn.split(TOKEN_DELIMITER);
		this.servicesService.revokeCertificate(serviceMrnAndVersion[0], serviceMrnAndVersion[1], certificateId, certificateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}

  private issueNewCertificateForUser(csr: string, userMrn: string, useServerGeneratedKeys: boolean,
									 observer: Observer<string | CertificateBundle>) {
    this.usersService.issueNewCertificate(csr, userMrn, useServerGeneratedKeys).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForUser(userMrn: string, certificateId:string, certicateRevocation:CertificateRevocation, observer: Observer<any>) {
		this.usersService.revokeCertificate(userMrn, certificateId, certicateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}

  private issueNewCertificateForVessel(csr: string, vesselMrn: string, useServerGeneratedKeys: boolean,
									   observer: Observer<string | CertificateBundle>) {
    this.vesselsService.issueNewCertificate(csr, vesselMrn, useServerGeneratedKeys).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForVessel(vesselMrn: string, certificateId:string, certificateRevocation:CertificateRevocation, observer: Observer<any>) {
		this.vesselsService.revokeCertificate(vesselMrn, certificateId, certificateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}
}
