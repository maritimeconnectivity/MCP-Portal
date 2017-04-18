import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Router, ActivatedRoute} from "@angular/router";
import {EntityImageModel} from "../../../../../theme/components/mcEntityImage/mcEntityImage.component";
import {AuthService} from "../../../../../authentication/services/auth.service";
import {Observable} from "rxjs";
import {Service} from "../../../../../backend-api/identity-registry/autogen/model/Service";
import {IdServicesService} from "../../../../../backend-api/identity-registry/services/id-services.service";

@Component({
  selector: 'service-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./service-list.html'),
  styles: []
})
export class ServiceListComponent implements OnInit {
	private KEY_NEW = 'KEY_NEW_SERVICE';
	private services:Array<Service>;
	public entityImageList: Array<EntityImageModel>;
  public organization: Organization;
  public isLoading: boolean;
  constructor(private authService: AuthService, private router:Router, private route:ActivatedRoute, private servicesService: IdServicesService, private orgService: OrganizationsService, private notifications:MCNotificationsService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadMyOrganization();
	  this.loadServices();
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

	private loadServices() {
		this.servicesService.getIdServices().subscribe(
			pageService => {
				this.services = pageService.content;
				this.isLoading = false;
				this.generateEntityImageList();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get services', MCNotificationType.Error, err);
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
	  if (this.services) {
		  this.services.forEach(service => {
			    this.entityImageList.push({imageSourceObservable:this.createImgObservable(service), entityId:service.mrn, title:service.name});
			  }
		  );
	  }
	  if (this.authService.authState.isAdmin()) {
		  this.entityImageList.push({imageSourceObservable:null, entityId:this.KEY_NEW, title:'Register new Service', isAdd:true});
	  }
  }

	private createImgObservable(service:Service):Observable<string> {
		let imageSrc = 'assets/img/no_service.svg';
		return Observable.create(observer => {
			observer.next(imageSrc);
		});
	}
}
