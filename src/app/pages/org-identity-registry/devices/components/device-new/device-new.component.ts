import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {Device} from "../../../../../backend-api/identity-registry/autogen/model/Device";


@Component({
  selector: 'device-new',
  encapsulation: ViewEncapsulation.None,
  template: require('./device-new.html'),
  styles: []
})
export class DeviceNewComponent implements OnInit {
  public organization: Organization;
  public isFormValid = false;
  public isLoading = true;

  public isRegistering = false;
  public registerTitle = "Register Device";
  public registerButtonClass = "btn btn-danger btn-raised";
  public onRegister: Function;

  constructor(private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService) {
    this.organization = {};
  }

  ngOnInit() {
    this.onRegister = this.register.bind(this);
    this.isRegistering = false;
    this.isLoading = true;
    this.loadMyOrganization();
  }

  public calculateFormValid() {
    this.isFormValid = false;
  }

  public cancel() {
    this.navigationService.cancelCreateDevice();
  }

  public register() {
    this.isRegistering = true;
    let device:Device = {};
    this.createDevice(device);
  }

  private createDevice(device:Device) {
	  this.notifications.generateNotification('Not Implemented', 'Register coming soon', MCNotificationType.Info);
   /*
    this.designsService.createDesign(design).subscribe(
      design => {
        this.navigationService.navigateToOrgDesign(design.designId, design.version);
        this.isRegistering = false;
      },
      err => {
        this.isRegistering = false;
        this.notifications.generateNotification('Error', 'Error when trying to create design', MCNotificationType.Error, err);
      }
    );
    */
  }

  private loadMyOrganization() {
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
        this.calculateFormValid();
	      this.isLoading = false;
      },
      err => {
	      this.isLoading = false;
        this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
      }
    );
  }

}
