import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Router, ActivatedRoute} from "@angular/router";
import {Vessel} from "../../../../../backend-api/identity-registry/autogen/model/Vessel";
import {VesselsService} from "../../../../../backend-api/identity-registry/services/vessels.service";
import {EntityImageModel} from "../../../../../theme/components/mcEntityImage/mcEntityImage.component";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {Observable} from "rxjs";

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
  constructor(private authService: AuthService, private router:Router, private route:ActivatedRoute, private vesselsService: VesselsService, private orgService: OrganizationsService, private notifications:MCNotificationsService) {
    this.organization = {};
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
			vessels => {
				this.vessels = vessels;
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
	  if (this.authService.authState.isAdmin()) {
		  this.entityImageList.push({imageSourceObservable:null, entityId:this.KEY_NEW, title:'Register new Vessel', isAdd:true});
	  }
  }

	private createImgObservable(vessel:Vessel):Observable<string> {
		let imageSrc = 'assets/img/no_ship.png';
		return Observable.create(observer => {
			observer.next(imageSrc);
		});
	}
}
