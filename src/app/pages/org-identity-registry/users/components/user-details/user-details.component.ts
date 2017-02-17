import { Component, ViewEncapsulation } from '@angular/core';
import {CertificateEntityType} from "../../../../shared/services/certificate-helper.service";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {ActivatedRoute, Router} from "@angular/router";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {User} from "../../../../../backend-api/identity-registry/autogen/model/User";
import {UsersService} from "../../../../../backend-api/identity-registry/services/users.service";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import FederationTypeEnum = Organization.FederationTypeEnum;
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";

@Component({
  selector: 'user-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./user-details.html'),
  styles: []
})
export class UserDetailsComponent {
	private organization:Organization;
	public labelValues:Array<LabelValueModel>;
	public title:string;
	public isLoading:boolean;
	public user:User;
	public entityType: CertificateEntityType;
	public certificateTitle: string;
	public showModal:boolean = false;
	public modalDescription:string;
	constructor(private authService:AuthService, private route: ActivatedRoute, private router:Router, private usersService: UsersService, private organizationService: OrganizationsService, private notifications:MCNotificationsService, private navigationHelper: NavigationHelperService) {

	}

	ngOnInit() {
		this.entityType = CertificateEntityType.User;
		this.loadOrganization();
		this.loadUser();
	}

	private loadUser() {
		this.isLoading = true;
		let mrn = this.route.snapshot.params['id'];
		this.usersService.getUser(mrn).subscribe(
			user => {
				this.user = user;
				this.title = user.firstName + " " + user.lastName;
				this.isLoading = false;
				this.generateLabelValues();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the user', MCNotificationType.Error, err);
			}
		);
	}

	private loadOrganization() {
		this.organizationService.getMyOrganization().subscribe(
			organization => {
				this.organization = organization;
			},
			err => {

			}
		);
	}

	public generateLabelValues() {
		this.labelValues = [];
		if (this.user) {
			this.labelValues.push({label: 'MRN', valueHtml: this.user.mrn});
			this.labelValues.push({label: 'First Name', valueHtml: this.user.firstName});
			this.labelValues.push({label: 'Last Name', valueHtml: this.user.lastName});
			this.labelValues.push({label: 'Email', valueHtml: this.user.email});
			this.labelValues.push({label: 'Permissions', valueHtml: this.user.permissions});
		}
	}

	public showUpdate():boolean {
		if (!this.organization) {
			return false;
		}
		return this.isAdmin() && this.organization.federationType === FederationTypeEnum.TestIdp;
	}

	public update() {
		this.navigationHelper.navigateToUpdateUser(this.user.mrn);
	}

	public showDelete():boolean {
		return this.isAdmin() && this.user != null;
	}

	private isAdmin() {
		return this.authService.authState.isAdmin();
	}

	private delete() {
		this.modalDescription = 'Are you sure you want to delete the user?';
		this.showModal = true;
	}
	public cancelModal() {
		this.showModal = false;
	}

	public deleteForSure() {
		this.isLoading = true;
		this.showModal = false;
		this.usersService.deleteUser(this.user.mrn).subscribe(
			() => {
				this.router.navigate(['../'], {relativeTo: this.route });
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to delete the user', MCNotificationType.Error, err);
			}
		);
	}
}
