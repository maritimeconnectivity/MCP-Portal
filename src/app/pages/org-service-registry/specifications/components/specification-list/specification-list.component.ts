import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {Router, ActivatedRoute} from "@angular/router";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";

@Component({
  selector: 'specification-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-list.html'),
  styles: []
})
export class SpecificationListComponent implements OnInit {
	public organization: Organization;
	public allOrganizations: Array<Organization>;
  public specifications: Array<Specification>;
  public isLoading: boolean;
  public onCreate: Function;
  public onGotoSpec: Function;
	public cardTitle:string;
  constructor(private navigationService: NavigationHelperService, private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private orgService: OrganizationsService, private specificationsService: SpecificationsService) {
  }

  ngOnInit() {
	  this.cardTitle = 'Loading ...';
    this.onCreate = this.createSpecification.bind(this);
    this.onGotoSpec = this.gotoSpecification.bind(this);

    this.isLoading = true;

	  this.loadMyOrganization();
    this.loadSpecifications();
  }

	private loadMyOrganization() {
		this.orgService.getMyOrganization().subscribe(
			organization => {
				this.organization = organization;
				// TODO: change when filtering on organization
				//this.cardTitle = 'Specifications for ' + organization.name;
				this.cardTitle = 'All Specifications';
			},
			err => {
				this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
			}
		);
	}

  private loadSpecifications() {
    this.specificationsService.getAllSpecifications().subscribe(
      specifications => {
        this.specifications = specifications;
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.notifications.generateNotification('Error', 'Error when trying to get specifications', MCNotificationType.Error, err);
      }
    );
  }

  private createSpecification() {
    this.navigationService.navigateToCreateSpecification();
  }

  private gotoSpecification(index:number) {
    this.router.navigate([this.specifications[index].specificationId], {queryParams: { specificationVersion: this.specifications[index].version}, relativeTo: this.route })
  }

}
