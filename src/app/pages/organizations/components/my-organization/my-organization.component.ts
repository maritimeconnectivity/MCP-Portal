import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../backend-api/identity-registry/services/organizations.service";
import {AuthService} from "../../../../authentication/services/auth.service";
import {CertificateEntityType} from "../../../shared/services/certificate-helper.service";

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


  constructor(private notifications: MCNotificationsService, private orgService: OrganizationsService, private authService: AuthService) {
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

  public logoLoaded() {
	  this.isLoading = false;
  }

}
