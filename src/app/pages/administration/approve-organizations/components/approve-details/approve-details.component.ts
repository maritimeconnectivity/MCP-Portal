import { Component, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";

@Component({
  selector: 'approve-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./approve-details.html'),
  styles: []
})
export class ApproveDetailsComponent {
	public organization:Organization;
	public title:string;
	public isLoading:boolean;
  constructor(private route: ActivatedRoute, private notifications:MCNotificationsService, private orgService: OrganizationsService) {

  }

  ngOnInit() {
	  this.title = 'Approve organization';
	  this.loadOrganization();
  }

	private loadOrganization() {
		this.isLoading = true;
		let orgMrn = this.route.snapshot.params['id'];

		this.orgService.getUnapprovedOrganization(orgMrn).subscribe(
		 organization => {
				this.organization = organization;
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the organization', MCNotificationType.Error, err);
			}
		);
	}
}
