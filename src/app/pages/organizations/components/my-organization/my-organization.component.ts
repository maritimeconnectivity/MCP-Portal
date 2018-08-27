import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Organization } from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {
    MCNotificationsService,
    MCNotificationType
} from "../../../../shared/mc-notifications.service";
import { OrganizationsService } from "../../../../backend-api/identity-registry/services/organizations.service";
import { AuthPermission, AuthService } from "../../../../authentication/services/auth.service";
import { CertificateEntityType } from "../../../shared/services/certificate-helper.service";
import { NavigationHelperService } from "../../../../shared/navigation-helper.service";

@Component({
  selector: 'my-organization',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: require('./my-organization.html')
})
export class MyOrganization implements OnInit {
  private organization: Organization;
  public isLoading = true;
  public entityType: CertificateEntityType;
  public certificateTitle: string;
  public titleName:string;


  constructor(private changeDetector: ChangeDetectorRef, private notifications: MCNotificationsService, private orgService: OrganizationsService, private authService: AuthService, private navigationHelper: NavigationHelperService) {
    this.entityType = CertificateEntityType.Organization;
  }

  ngOnInit() {
    this.isLoading = true;
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
        this.titleName = organization.name;
        this.certificateTitle = organization.name;
      },
      err => {
        this.isLoading = false;
        this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
      }
    );
  }


	ngOnDestroy() {
		this.changeDetector.detach();
	}

  public logoLoaded() {
	  this.isLoading = false;
	  this.changeDetector.detectChanges();
  }

	private shouldDisplayUpdate() :boolean {
		return this.authService.authState.hasPermission(AuthPermission.OrgAdmin);
	}

	public update() {
		this.navigationHelper.navigateToUpdateMyOrg();
	}
}
