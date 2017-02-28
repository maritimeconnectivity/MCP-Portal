import {Injectable} from "@angular/core";
import {Router, Route, ActivatedRoute} from "@angular/router";
import {CertificateEntityType} from "../pages/shared/services/certificate-helper.service";
import {MCNotificationsService, MCNotificationType} from "./mc-notifications.service";
import {PAGES_MENU} from "../pages/pages.component";

//TODO: I cannot for the life of me find a way to get the url of a component and navigate to the url. Thus this helper class :-( But hey I then had to make a recursive function and who doesn't love that :-)

export const queryKeys = {
  ENTITY_TYPE: "entityType",
	ENTITY_MRN: "entityMrn",
	CERT_ID: "certId",
  ENTITY_TITLE: "entityTitle"
};

@Injectable()
export class NavigationHelperService {
  private path:string;
	private pathBeforeCreateIdService:string;
	private pathBeforeUpdateIdService:string;
  private pathBeforeCerticates:string;
  private pathBeforeCreateSpecification:string;
  private pathBeforeCreateDesign:string;
  private pathBeforeCreateInstance:string;
  constructor(private notificationService: MCNotificationsService, private router: Router, private activatedRoute: ActivatedRoute) {
  }

	public navigateToIssueNewCertificate(entityType: CertificateEntityType, entityMrn:string, entityTitle: string) {
		this.pathBeforeCerticates = this.router.url;
		this.path = '/issuecert';
		let pagesMenu = PAGES_MENU;
		var pathElement = "";
		switch (entityType) {
			case CertificateEntityType.Device: {
				pathElement = "devices";
				break;
			}
			case CertificateEntityType.Organization: {
				pathElement = "my-organization";
				break;
			}
			case CertificateEntityType.Service: {
				pathElement = "instances";
				break;
			}
			case CertificateEntityType.User: {
				pathElement = "users";
				break;
			}
			case CertificateEntityType.Vessel: {
				pathElement = "vessels";
				break;
			}
			default: {
				this.notificationService.generateNotification("Error", "Error when trying to navigate to issue new certificate.\n Missing: " + entityType, MCNotificationType.Error);
				return;
			}
		}
		this.generatePath(pathElement, pagesMenu[0]);

		this.router.navigate([this.path], { queryParams: { entityType: entityType, entityMrn: entityMrn, entityTitle:entityTitle}});
	}

	public navigateToRevokeCertificate(entityType: CertificateEntityType, entityMrn:string, entityTitle: string, certificateId:number) {
		this.pathBeforeCerticates = this.router.url;
		this.path = '/revokecert';
		let pagesMenu = PAGES_MENU;
		var pathElement = "";
		switch (entityType) {
			case CertificateEntityType.Device: {
				pathElement = "devices";
				break;
			}
			case CertificateEntityType.Organization: {
				pathElement = "my-organization";
				break;
			}
			case CertificateEntityType.Service: {
				pathElement = "instances";
				break;
			}
			case CertificateEntityType.User: {
				pathElement = "users";
				break;
			}
			case CertificateEntityType.Vessel: {
				pathElement = "vessels";
				break;
			}
			default: {
				this.notificationService.generateNotification("Error", "Error when trying to navigate to revoke certificate.\n Missing: " + entityType, MCNotificationType.Error);
				return;
			}
		}
		this.generatePath(pathElement, pagesMenu[0]);

		this.router.navigate([this.path], { queryParams: { entityType: entityType, entityMrn: entityMrn, entityTitle:entityTitle, certId:certificateId}});
	}

  public cancelNavigateCertificates() {
    if (this.pathBeforeCerticates) {
      this.router.navigateByUrl(this.pathBeforeCerticates);
    } else {
      this.takeMeHome();
    }
  }

  // No idea where to go, just take me home
  public takeMeHome() {
    this.router.navigateByUrl('/');
  }

	public cancelCreateVessel() {
		this.path = '/';
		let pagesMenu = PAGES_MENU;
		this.generatePath('vessels', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public cancelCreateDevice() {
		this.path = '/';
		let pagesMenu = PAGES_MENU;
		this.generatePath('devices', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public cancelCreateService() {
		if (this.pathBeforeCreateIdService) {
			this.router.navigateByUrl(this.pathBeforeCreateIdService);
		} else {
			this.navigateToOrgInstance('', '');
		}
	}

	public gobackFromUpdateService() {
		if (this.pathBeforeUpdateIdService) {
			this.router.navigateByUrl(this.pathBeforeUpdateIdService);
		} else {
			this.navigateToOrgInstance('', '');
		}
	}

	public cancelCreateUser() {
		this.path = '/';
		let pagesMenu = PAGES_MENU;
		this.generatePath('users', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

  public cancelCreateSpecification() {
    if (this.pathBeforeCreateSpecification) {
      this.router.navigateByUrl(this.pathBeforeCreateSpecification);
    } else {
      this.navigateToOrgSpecification('', '');
    }
  }

  public cancelCreateDesign() {
    if (this.pathBeforeCreateDesign) {
      this.router.navigateByUrl(this.pathBeforeCreateDesign);
    } else {
      this.navigateToOrgDesign('', '');
    }
  }

  public cancelCreateInstance() {
    if (this.pathBeforeCreateInstance) {
      this.router.navigateByUrl(this.pathBeforeCreateInstance);
    } else {
      this.navigateToOrgInstance('', '');
    }
  }

	public navigateToUpdateMyOrg():void {
		this.path = '/update';
		let pagesMenu = PAGES_MENU;
		this.generatePath('my-organization', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToUpdateUser(userMrn:string):void {
		this.path = '/update/' + userMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('users', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToUpdateDevice(deviceMrn:string):void {
		this.path = '/update/' + deviceMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('devices', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToUpdateVessel(vesselMrn:string):void {
		this.path = '/update/' + vesselMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('vessels', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToUpdateIdService(serviceMrn:string):void {
		this.pathBeforeUpdateIdService = this.router.url;
		this.path = '/update-id/' + serviceMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('instances', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToDevice(deviceMrn:string):void {
		this.path = '/' + deviceMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('devices', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToService(serviceMrn:string):void {
		this.path = '/' + serviceMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('services', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToUser(userMrn:string):void {
		this.path = '/' + userMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('users', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToVessel(vesselMrn:string):void {
		this.path = '/' + vesselMrn;
		let pagesMenu = PAGES_MENU;
		this.generatePath('vessels', pagesMenu[0]);

		this.router.navigate([this.path]);
	}

	public navigateToCreateIdService(mrn:string, name:string) {
		this.pathBeforeCreateIdService = this.router.url;
		this.path = '/register-id';
		let pagesMenu = PAGES_MENU;
		this.generatePath('instances', pagesMenu[0]);
		this.router.navigate([this.path], { queryParams: { mrn: mrn, name: name }, preserveQueryParams: false});
	}

  public navigateToCreateSpecification() {
    this.pathBeforeCreateSpecification = this.router.url;
    this.path = '/register';
    let pagesMenu = PAGES_MENU;
    this.generatePath('specifications', pagesMenu[0]);

    this.router.navigate([this.path]);
  }

  public navigateToCreateDesign(specificationId:string, specificationVersion:string) {
    this.pathBeforeCreateDesign = this.router.url;
    this.path = '/register';
    let pagesMenu = PAGES_MENU;
    this.generatePath('designs', pagesMenu[0]);

    this.router.navigate([this.path], { queryParams: { specificationId: specificationId, specificationVersion: specificationVersion }, preserveQueryParams: false});
  }

  public navigateToCreateInstance(designId:string, designVersion:string) {
    this.pathBeforeCreateInstance = this.router.url;
    this.path = '/register';
    let pagesMenu = PAGES_MENU;
    this.generatePath('instances', pagesMenu[0]);

    this.router.navigate([this.path], {queryParams: {designId: designId, designVersion: designVersion}, preserveQueryParams: false});
  }

  public navigateToOrgDesign(designId:string, version:string):void {
    this.path = '/' + designId;
    let pagesMenu = PAGES_MENU;
    this.generatePath('designs', pagesMenu[0]);

    this.router.navigate([this.path], {queryParams: {designVersion: version}});
  }

  public navigateToOrgSpecification(specificationId:string, version:string):void {
    this.path = '/' + specificationId;
    let pagesMenu = PAGES_MENU;
    this.generatePath('specifications', pagesMenu[0]);

    this.router.navigate([this.path], {queryParams: {specificationVersion: version}});
  }

  public navigateToOrgInstance(instanceId:string, version:string):void {
    this.path = '/' + instanceId;
    let pagesMenu = PAGES_MENU;
    this.generatePath('instances', pagesMenu[0]);

    this.router.navigate([this.path], {queryParams: {instanceVersion: version}});
  }

  private generatePath(nameOfElement:string, route: Route):boolean {
    if (route.path === nameOfElement) {
      this.path = '/' + route.path + this.path;
      return true;
    }
    if (route.children && route.children.length > 0) {
      var found = false;
      route.children.forEach(routeChild => {
        if (this.generatePath(nameOfElement, routeChild)) {
          found = true;
        }
      });
      if (found) {
        this.path = '/' + route.path + this.path;
        return true;
      }
    }
    return false;
  }
}
