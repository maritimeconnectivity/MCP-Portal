import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {Router, ActivatedRoute} from "@angular/router";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";

@Component({
  selector: 'design-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-list.html'),
  styles: []
})
export class DesignListComponent implements OnInit {
  public organization: Organization;
  public designs: Array<Design>;
  public isLoading: boolean;
  public onCreate: Function;
  public onGotoDesign: Function;
  constructor(private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private orgService: OrganizationsService, private designsService: DesignsService) {
    this.organization = {};
  }

  ngOnInit() {
    this.onCreate = this.createDesign.bind(this);
    this.onGotoDesign = this.gotoDesign.bind(this);

    this.isLoading = true;
    this.loadMyOrganization();
    this.loadDesign();
  }

  private loadDesign() {
    this.designsService.getDesignsForMyOrg().subscribe(
      designs => {
        this.designs = designs;
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get designs', type:MCNotificationType.Error});
      }
    );
  }

  private loadMyOrganization() {
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
      },
      err => {
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get organization', type:MCNotificationType.Error});
      }
    );
  }

  private createDesign() {
    this.notifications.generateNotification({title:'Not implemented', message:'Register new design', type:MCNotificationType.Info});
  }

  private gotoDesign(index:number) {
    this.router.navigate([this.designs[index].designId], {relativeTo: this.route })
  }

}
