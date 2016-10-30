import {Injectable, OnInit} from '@angular/core';
import {Observable, Observer} from "rxjs";
import {PemCertificate} from "../autogen/model/PemCertificate";
import {CertificateEntityType} from "../../../pages/shared/services/certificate-helper.service";
import {OrganizationsService} from "./organizations.service";
import {DevicesService} from "./devices.service";
import {IdServicesService} from "./id-services.service";
import {UsersService} from "./users.service";
import {VesselsService} from "./vessels.service";

@Injectable()
export class CertificatesService implements OnInit {

  constructor(private organizationsService: OrganizationsService, private devicesService: DevicesService, private servicesService: IdServicesService, private usersService: UsersService, private vesselsService: VesselsService) {
  }

  ngOnInit() {

  }

  public issueNewCertificate(entityType: CertificateEntityType, entityMrn) : Observable<PemCertificate> {
    if (!entityType || !entityMrn) { // We lost our state data somehow???
      throw new Error('Internal state lost');
    }
    return Observable.create(observer => {
      switch (entityType) {
        case CertificateEntityType.Device: {
          this.issueNewCertificateForDevice(entityMrn, observer);
          break;
        }
        case CertificateEntityType.Organization: {
          this.issueNewCertificateForOrganization(observer)
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

  private issueNewCertificateForService(serviceMrn: string, observer: Observer<any>) {
    this.servicesService.issueNewCertificate(serviceMrn).subscribe(
      pemCertificate => {
        observer.next(pemCertificate);
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
}
