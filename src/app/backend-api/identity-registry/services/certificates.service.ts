import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {CertificateEntityType} from "../../../pages/shared/services/certificate-helper.service";
import {OrganizationsService} from "./organizations.service";
import {DevicesService} from "./devices.service";
import {IdServicesService} from "./id-services.service";
import {UsersService} from "./users.service";
import {VesselsService} from "./vessels.service";
import {CertificateRevocation} from "../autogen/model/CertificateRevocation";
import {TOKEN_DELIMITER} from "../../../shared/app.constants";

@Injectable()
export class CertificatesService implements OnInit {

  constructor(private organizationsService: OrganizationsService, private devicesService: DevicesService, private servicesService: IdServicesService, private usersService: UsersService, private vesselsService: VesselsService) {
  }

  ngOnInit() {

  }

	public issueNewCertificate(entityType: CertificateEntityType, entityMrn:string) : Observable<PemCertificate> {
		if (entityType == null || !entityMrn) { // We lost our state data somehow???
			throw new Error('Internal state lost');
		}
		return Observable.create(observer => {
			switch (entityType) {
				case CertificateEntityType.Device: {
					this.issueNewCertificateForDevice(entityMrn, observer);
					break;
				}
				case CertificateEntityType.Organization: {
					this.issueNewCertificateForOrganization(observer);
					break;
				}
				case CertificateEntityType.Service: {
					this.issueNewCertificateForService(entityMrn, observer);
					break;
				}
				case CertificateEntityType.User: {
					this.issueNewCertificateForUser(entityMrn, observer);
					break;
				}
				case CertificateEntityType.Vessel: {
					this.issueNewCertificateForVessel(entityMrn, observer);
					break;
				}
			}
		});
	}

	public revokeCertificate(entityType: CertificateEntityType, entityMrn:string, certificateId:string, certicateRevocation:CertificateRevocation) : Observable<any> {
		if (entityType == null || !entityMrn) { // We lost our state data somehow???
			throw new Error('Internal state lost');
		}

		return Observable.create(observer => {
			switch (entityType) {
				case CertificateEntityType.Device: {
					this.revokeCertificateForDevice(entityMrn, certificateId, certicateRevocation, observer);
					break;
				}
				case CertificateEntityType.Organization: {
					this.revokeCertificateForOrganization(certificateId, certicateRevocation, observer);
					break;
				}
				case CertificateEntityType.Service: {
					this.revokeCertificateForService(entityMrn, certificateId, certicateRevocation, observer);
					break;
				}
				case CertificateEntityType.User: {
					this.revokeCertificateForUser(entityMrn, certificateId, certicateRevocation, observer);
					break;
				}
				case CertificateEntityType.Vessel: {
					this.revokeCertificateForVessel(entityMrn, certificateId, certicateRevocation, observer);
					break;
				}
			}
		});
	}

  private issueNewCertificateForOrganization(observer: Observer<any>) {
    this.organizationsService.issueNewCertificate().subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForOrganization(certificateId:string, certicateRevocation:CertificateRevocation, observer: Observer<any>) {
		this.organizationsService.revokeCertificate(certificateId, certicateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}

  private issueNewCertificateForDevice(deviceMrn: string, observer: Observer<any>) {
    this.devicesService.issueNewCertificate(deviceMrn).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForDevice(deviceMrn: string, certificateId:string, certicateRevocation:CertificateRevocation, observer: Observer<any>) {
		this.devicesService.revokeCertificate(deviceMrn, certificateId, certicateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}

  private issueNewCertificateForService(serviceMrn: string, observer: Observer<any>) {
	  let serviceMrnAndVersion = serviceMrn.split(TOKEN_DELIMITER);
    this.servicesService.issueNewCertificate(serviceMrnAndVersion[0], serviceMrnAndVersion[1]).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForService(serviceMrn: string, certificateId:string, certicateRevocation:CertificateRevocation, observer: Observer<any>) {
  	let serviceMrnAndVersion = serviceMrn.split(TOKEN_DELIMITER);
		this.servicesService.revokeCertificate(serviceMrnAndVersion[0], serviceMrnAndVersion[1], certificateId, certicateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}

  private issueNewCertificateForUser(userMrn: string, observer: Observer<any>) {
    this.usersService.issueNewCertificate(userMrn).subscribe(
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

  private issueNewCertificateForVessel(vesselMrn: string, observer: Observer<any>) {
    this.vesselsService.issueNewCertificate(vesselMrn).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
      },
      err => {
        observer.error(err);
      }
    );
  }

	private revokeCertificateForVessel(vesselMrn: string, certificateId:string, certicateRevocation:CertificateRevocation, observer: Observer<any>) {
		this.vesselsService.revokeCertificate(vesselMrn, certificateId, certicateRevocation).subscribe(
			res => {
				observer.next(res);
			},
			err => {
				observer.error(err);
			}
		);
	}
}
