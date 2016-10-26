import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";
import {OrganizationsService} from "../../backend-api/identity-registry/services/organizations.service";
import {Organization} from "../../backend-api/identity-registry/autogen/model/Organization";
import {AuthService} from "../../authentication/services/auth.service";

@Component({
  selector: 'my-organization',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: require('./my-organization.html')
})
export class MyOrganization implements OnInit {
  private organization: Organization;


  constructor(private notifications: MCNotificationsService, private orgService: OrganizationsService, private authService: AuthService) {
    this.organization = {};
  }

  ngOnInit() {
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
      },
      err => {
        this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error);
      }
    );
  }
}
