import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'specification-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-list.html'),
  styles: []
})
export class SpecificationListComponent implements OnInit {
  private organization: Organization;
  private specifications: Array<Specification>;
  private isLoading: boolean;
  private onCreate: Function;
  private onGotoSpec: Function;
  constructor(private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private orgService: OrganizationsService, private specificationsService: SpecificationsService) {
    this.organization = {};
  }

  ngOnInit() {
    this.onCreate = this.createSpecification.bind(this);
    this.onGotoSpec = this.gotoSpecification.bind(this);

    this.isLoading = true;
    this.orgService.getMyOrganization().subscribe(
      organization => {
        this.organization = organization;
      },
      err => {
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get organization', type:MCNotificationType.Error});
      }
    );

    this.specificationsService.getSpecificationsForMyOrg().subscribe(
      specifications => {
        this.specifications = specifications;
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.notifications.generateNotification({title:'Error', message:'Error when trying to get specifications', type:MCNotificationType.Error});
      }
    );
  }

  private createSpecification() {
    this.notifications.generateNotification({title:'Not implemented', message:'Register new Specification', type:MCNotificationType.Info});
  }

  private gotoSpecification(specification: Specification) {
    this.router.navigate([specification.specificationId], {relativeTo: this.route })
  }

}
