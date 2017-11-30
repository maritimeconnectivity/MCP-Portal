import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Router, ActivatedRoute} from "@angular/router";
import {EntityImageModel} from "../../../../../theme/components/mcEntityImage/mcEntityImage.component";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {Observable} from "rxjs";
import {User} from "../../../../../backend-api/identity-registry/autogen/model/User";
import {UsersService} from "../../../../../backend-api/identity-registry/services/users.service";
import FederationTypeEnum = Organization.FederationTypeEnum;

@Component({
  selector: 'user-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./user-list.html'),
  styles: []
})
export class UserListComponent implements OnInit {
	private KEY_NEW = 'KEY_NEW_USER';
	private users:Array<User>;
	public entityImageList: Array<EntityImageModel>;
  public organization: Organization;
  public isLoading: boolean;
  constructor(private authService: AuthService, private router:Router, private route:ActivatedRoute, private usersService: UsersService, private orgService: OrganizationsService, private notifications:MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadMyOrganization();
  }

	private loadMyOrganization() {
		this.orgService.getMyOrganization().subscribe(
			organization => {
				this.organization = organization;
				this.loadUsers();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

	private loadUsers() {
		this.usersService.getUsers().subscribe(
			pageUser => {
				this.users = pageUser.content;
				this.isLoading = false;
				this.generateEntityImageList();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get users', MCNotificationType.Error, err);
			}
		);
	}

	public gotoDetails(entityModel:EntityImageModel) {
		if (entityModel.entityId === this.KEY_NEW) {
			this.gotoCreate();
		} else {
			this.router.navigate([entityModel.entityId], {relativeTo: this.route});
		}
	}

	public gotoCreate() {
		this.router.navigate(['register'], {relativeTo: this.route});
	}

  private generateEntityImageList() {
	  this.entityImageList = [];
	  if (this.users) {
		  this.users.forEach(user => {
			  var htmlContent = '&nbsp;';
			  if (user.email) {
				  htmlContent = "<a href='mailto:" + user.email + "'>" + user.email + "</a>";
			  }
			    this.entityImageList.push({imageSourceObservable:this.createImgObservable(user), entityId:user.mrn, title:user.firstName + " " + user.lastName, htmlContent:htmlContent});
			  }
		  );
	  }
	  if (this.canCreateUser()) {
		  this.entityImageList.push({imageSourceObservable:null, entityId:this.KEY_NEW, title:'Register new User', isAdd:true, htmlContent: '&nbsp;'});
	  }
  }

  private canCreateUser():boolean {
  	return this.authService.authState.isAdmin() && this.organization && this.organization.federationType != FederationTypeEnum.ExternalIdp;
  }

	private createImgObservable(user:User):Observable<string> {
		let imageSrc = 'assets/img/no_user.png';
		return Observable.create(observer => {
			observer.next(imageSrc);
		});
	}
}
