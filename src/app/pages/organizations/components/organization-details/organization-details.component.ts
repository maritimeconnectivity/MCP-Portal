import { Component, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {MCNotificationsService, MCNotificationType} from "../../../../shared/mc-notifications.service";
import {Organization} from "../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../backend-api/identity-registry/services/organizations.service";

@Component({
  selector: 'organization-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./organization-details.html'),
  styles: []
})
export class OrganizationDetailsComponent {
	public isLoading:boolean;
	public organization:Organization;
	constructor(private orgService: OrganizationsService, private route: ActivatedRoute, private notifications:MCNotificationsService) {

	}

	ngOnInit() {
		this.loadOrganization();
	}

	private loadOrganization() {
		this.isLoading = true;
		let mrn = this.route.snapshot.params['id'];
		this.orgService.getOrganization(mrn).subscribe(
			organization => {
				this.organization = organization;
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}
}
