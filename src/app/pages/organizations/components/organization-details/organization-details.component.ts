import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import {
    MCNotificationsService,
    MCNotificationType
} from "../../../../shared/mc-notifications.service";
import { Organization } from "../../../../backend-api/identity-registry/autogen/model/Organization";
import { OrganizationsService } from "../../../../backend-api/identity-registry/services/organizations.service";
import { AuthPermission, AuthService } from "../../../../authentication/services/auth.service";

@Component({
  selector: 'organization-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./organization-details.html'),
  styles: []
})
export class OrganizationDetailsComponent {
	public shouldDisplayDelete:boolean;
	public isLoading:boolean;
	public organization:Organization;
	public showModal:boolean = false;
	public modalDescription:string;
	constructor(private authService:AuthService, private orgService: OrganizationsService, private router:Router, private route: ActivatedRoute, private notifications:MCNotificationsService) {

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
				this.setShouldDisplayDelete();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

	private setShouldDisplayDelete() {
		this.shouldDisplayDelete = !this.authService.isMyOrg(this.organization.mrn) && this.authService.authState.hasPermission(AuthPermission.SiteAdmin);
	}

	private delete() {
		this.modalDescription = "Are you sure you want to delete the organization?<br><br>All entities will be deleted and all issued certificates will be revoked.";
		this.showModal = true;
	}
	public cancelModal() {
		this.showModal = false;
	}

	public deleteForSure() {
		this.isLoading = true;
		this.showModal = false;
		this.orgService.deleteOrganization(this.organization.mrn).subscribe(
			() => {
				this.router.navigate(['../'], {relativeTo: this.route });
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete the organization', MCNotificationType.Error, err);
			}
		);
	}
}
