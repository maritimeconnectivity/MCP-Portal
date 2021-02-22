import { Component, ViewEncapsulation } from '@angular/core';
import { Organization } from "../../../../backend-api/identity-registry/autogen/model/Organization";
import { EntityImageModel } from "../../../../theme/components/mcEntityImage/mcEntityImage.component";
import { ActivatedRoute, Router } from "@angular/router";
import { OrganizationsService } from "../../../../backend-api/identity-registry/services/organizations.service";
import {
	MCNotificationsService,
	MCNotificationType
} from "../../../../shared/mc-notifications.service";
import { AuthService } from "../../../../authentication/services/auth.service";
import { Observable } from "rxjs";
import { LogoService } from "../../../../backend-api/identity-registry/services/logo.service";

@Component({
  selector: 'organization-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./organization-list.html'),
  styles: []
})
export class OrganizationListComponent {
	private organizations:Array<Organization>;
	public entityImageList: Array<EntityImageModel>;
  public isLoading: boolean;
  constructor(private logoService: LogoService, private authService: AuthService, private router:Router, private route:ActivatedRoute, private orgService: OrganizationsService, private notifications:MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = true;
	  this.loadOrganizations();
  }

	private loadOrganizations() {
		this.orgService.getAllOrganizations().subscribe(
			organizations => {
				this.organizations = organizations;
				this.isLoading = false;
				this.generateEntityImageList();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get organizations', MCNotificationType.Error, err);
			}
		);
	}

	public gotoDetails(entityModel:EntityImageModel) {
		if (this.isMyOrg(entityModel.entityId)) {
			this.router.navigate(['/']);
		} else {
			this.router.navigate([entityModel.entityId], {relativeTo: this.route});
		}
	}

	private isMyOrg(orgMrn) {
		return this.authService.authState.orgMrn === orgMrn;
	}

  private generateEntityImageList() {
	  this.entityImageList = [];
	  if (this.organizations) {
		  this.organizations.forEach(organization => {
			    var htmlContent = '&nbsp;';
			    if (organization.email) {
				    htmlContent = "<a href='mailto:" + organization.email + "'>" + organization.email + "</a>";
			    }
			    this.entityImageList.push({imageSourceObservable:this.createImgObservable(organization), entityId:organization.mrn, title:organization.name, htmlContent:htmlContent});
			  }
		  );
	  }
  }
  private createImgObservable(organization:Organization):Observable<string> {
	  let imageSrc = 'assets/img/no_organization.png';
	  return Observable.create(observer => {
		  this.logoService.getLogoForOrganization(organization.mrn).subscribe(
			  logo => {
				  observer.next(URL.createObjectURL(new Blob([logo])));
			  },
			  err => {
				  observer.next(imageSrc);
			  }
		  );
	  });
  }

}
