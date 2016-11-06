import { Component, ViewEncapsulation } from '@angular/core';
import {CertificateEntityType} from "../../../../shared/services/certificate-helper.service";
import {LabelValueModel} from "../../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {ActivatedRoute} from "@angular/router";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {User} from "../../../../../backend-api/identity-registry/autogen/model/User";
import {UsersService} from "../../../../../backend-api/identity-registry/services/users.service";

@Component({
  selector: 'user-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./user-details.html'),
  styles: []
})
export class UserDetailsComponent {
	public labelValues:Array<LabelValueModel>;
	public title:string;
	public isLoading:boolean;
	public user:User;
	public entityType: CertificateEntityType;
	public certificateTitle: string;
	constructor(private route: ActivatedRoute, private usersService: UsersService, private notifications:MCNotificationsService) {

	}

	ngOnInit() {
		this.entityType = CertificateEntityType.User;
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
}
