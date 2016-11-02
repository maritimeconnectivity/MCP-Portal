import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationType, MCNotificationsService} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Router, ActivatedRoute} from "@angular/router";
import {EntityImageModel} from "../../../../../theme/components/mcEntityImage/mcEntityImage.component";
import {Device} from "../../../../../backend-api/identity-registry/autogen/model/Device";
import {DevicesService} from "../../../../../backend-api/identity-registry/services/devices.service";
import {AuthService} from "../../../../../authentication/services/auth.service";

@Component({
  selector: 'device-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./device-list.html'),
  styles: []
})
export class DeviceListComponent implements OnInit {
	private KEY_NEW = 'KEY_NEW_DEVICE';
	private devices:Array<Device>;
	public entityImageList: Array<EntityImageModel>;
  public organization: Organization;
  public isLoading: boolean;
  constructor(private authService: AuthService, private router:Router, private route:ActivatedRoute, private devicesService: DevicesService, private orgService: OrganizationsService, private notifications:MCNotificationsService) {
    this.organization = {};
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadMyOrganization();
	  this.loadDevices();
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

	private loadDevices() {
		this.devicesService.getDevices().subscribe(
			devices => {
				this.devices = devices;
				this.isLoading = false;
				this.generateEntityImageList();
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get devices', MCNotificationType.Error, err);
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
	  if (this.devices) {
		  let imageSrc = 'assets/img/no_device.svg';
		  this.devices.forEach(device => {
			    this.entityImageList.push({imageSource:imageSrc, entityId:device.mrn, title:device.name});
			  }
		  );
	  }
	  if (this.authService.authState.isAdmin()) {
		  this.entityImageList.push({imageSource:'', entityId:this.KEY_NEW, title:'Register new Device', isAdd:true});
	  }
  }

}
