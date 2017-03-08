import {Component, ViewEncapsulation, Input} from '@angular/core';
import {EntityImageModel} from "../../../../theme/components/mcEntityImage/mcEntityImage.component";
import {AuthService} from "../../../../authentication/services/auth.service";
import {Observable} from "rxjs";
import {LogoService} from "../../../../backend-api/identity-registry/services/logo.service";
import {Endorsement} from "../../../../backend-api/endorsements/autogen/model/Endorsement";
import {NavigationHelperService} from "../../../../shared/navigation-helper.service";
import {OrganizationsService} from "../../../../backend-api/identity-registry/services/organizations.service";

@Component({
  selector: 'endorsed-by-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./endorsed-by-list.html'),
  styles: []
})
export class EndorsedByListComponent {
	@Input() endorsements:Array<Endorsement>;
	@Input() isLoading:boolean;
	@Input() title:string;

	private oldEndorsements:Array<Endorsement>;
	public entityImageList: Array<EntityImageModel>;

  constructor(private logoService: LogoService, private authService: AuthService, private orgService:OrganizationsService, private navigationHelper:NavigationHelperService) {
  }

  ngOnInit() {
	  this.generateEntityImageList();
  }

	ngOnChanges() {
		this.generateEntityImageList();
	}

	public gotoDetails(entityModel:EntityImageModel) {
		if (this.isMyOrg(entityModel.entityId)) {
			this.navigationHelper.takeMeHome();
		} else {
			this.navigationHelper.navigateToOrganizationDetails(entityModel.entityId)
		}
	}

	private isMyOrg(orgMrn) {
		return this.authService.authState.orgMrn === orgMrn;
	}

  private generateEntityImageList() {
  	if (this.endorsements) {
  		if (this.endorsements !== this.oldEndorsements) { // Check to see if the endorsements is the same as last time we generated the list, because no need to do all this load again if not needed
				this.oldEndorsements = this.endorsements;
			  this.entityImageList = [];
			  this.endorsements.forEach(endorsement => {
				    var htmlContent = '&nbsp;';
						let entityImage:EntityImageModel = {imageSourceObservable:this.createImgObservable(endorsement.orgMrn), entityId:endorsement.orgMrn, title:endorsement.orgName, htmlContent:htmlContent};

				    this.entityImageList.push(entityImage);
				  }
			  );
		  }
	  }
  }

  private createImgObservable(orgMrn:string):Observable<string> {
	  let imageSrc = 'assets/img/no_organization.png';
	  return Observable.create(observer => {
		  this.logoService.getLogoForOrganization(orgMrn).subscribe(
			  logo => {
				  observer.next(URL.createObjectURL(new Blob([logo])));
			  },
			  err => {
				  observer.next(imageSrc);
			  }
		  );
	  });
  }

	private setRealOrganizationName(entityImage:EntityImageModel, organizationMrn:string) {
		this.orgService.getOrganizationName(organizationMrn).subscribe(
			organizationName => {
				entityImage.title = organizationName;
			},
			err => {
				// Do nothing. We already have a name set, which should be correct 99% of the time
			}
		);
	}

}
