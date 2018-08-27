import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
    MCNotificationsService,
    MCNotificationType
} from "../../../../../shared/mc-notifications.service";
import { Organization } from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import { OrganizationsService } from "../../../../../backend-api/identity-registry/services/organizations.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Vessel } from "../../../../../backend-api/identity-registry/autogen/model/Vessel";
import { VesselsService } from "../../../../../backend-api/identity-registry/services/vessels.service";
import { EntityImageModel } from "../../../../../theme/components/mcEntityImage/mcEntityImage.component";
import { AuthPermission, AuthService } from "../../../../../authentication/services/auth.service";
import { Observable } from "rxjs";
import { VesselImageService } from "../../../../../backend-api/identity-registry/services/vessel-image.service";

@Component({
  selector: 'vessel-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./vessel-list.html'),
  styles: []
})
export class VesselListComponent implements OnInit {
	private KEY_NEW = 'KEY_NEW_VESSEL';
	private vessels:Array<Vessel>;
	public entityImageList: Array<EntityImageModel>;
  public organization: Organization;
  public isLoading: boolean;
  constructor(private vesselImageService:VesselImageService, private authService: AuthService, private router:Router, private route:ActivatedRoute, private vesselsService: VesselsService, private orgService: OrganizationsService, private notifications:MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadMyOrganization();
	  this.loadVessels();
  }

	private loadMyOrganization() {
		this.orgService.getMyOrganization().subscribe(
			organization => {
				this.organization = organization;
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

	private loadVessels() {
		this.vesselsService.getVessels().subscribe(
			pageVessel => {
				this.vessels = pageVessel.content;
				this.isLoading = false;
				this.generateEntityImageList();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get vessels', MCNotificationType.Error, err);
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
	  this.router.navigate(['register'], {relativeTo: this.route})
  }

  private generateEntityImageList() {
	  this.entityImageList = [];
	  if (this.vessels) {
		  this.vessels.forEach(vessel => {
			    this.entityImageList.push({imageSourceObservable:this.createImgObservable(vessel), entityId:vessel.mrn, title:vessel.name});
			  }
		  );
	  }
	  if (this.authService.authState.hasPermission(AuthPermission.VesselAdmin)) {
		  this.entityImageList.push({imageSourceObservable:null, entityId:this.KEY_NEW, title:'Register new Vessel', isAdd:true});
	  }
  }

	private createImgObservable(vessel:Vessel):Observable<string> {
		let imageSrc = 'assets/img/no_ship.png';
		return Observable.create(observer => {
			this.vesselImageService.getImageForVessel(vessel.mrn).subscribe(
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
