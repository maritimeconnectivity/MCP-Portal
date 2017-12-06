import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {Router, ActivatedRoute} from "@angular/router";
import {Instance} from "../../../../../backend-api/service-registry/autogen/model/Instance";
import {InstancesService} from "../../../../../backend-api/service-registry/services/instances.service";
import {SrSearchRequestsService} from "../../../shared/services/sr-search-requests.service";
import {ServiceRegistrySearchRequest} from "../../../../shared/components/service-registry-search/ServiceRegistrySearchRequest";

const SEARCH_KEY = 'InstanceListComponent';
@Component({
  selector: 'instance-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./instance-list.html'),
  styles: []
})
export class InstanceListComponent implements OnInit {
	public searchKey = SEARCH_KEY;
	public isSearching = false;
	private initialSearchRequest: ServiceRegistrySearchRequest;
  public organization: Organization;
  public instances: Array<Instance>;
  public isLoading: boolean;
  public onGotoInstance: Function;
	public cardTitle:string;
  constructor(private searchRequestsService:SrSearchRequestsService, private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private orgService: OrganizationsService, private instancesService: InstancesService) {
  }

  ngOnInit() {
	  this.cardTitle = 'Instances';
    this.onGotoInstance = this.gotoInstance.bind(this);

    this.isLoading = true;
    this.loadMyOrganization();
    this.loadInstances();
  }

	public search(searchRequest: ServiceRegistrySearchRequest) {
		this.isSearching = true;
		this.searchInstances(searchRequest);
	}

	private searchInstances(searchRequest: ServiceRegistrySearchRequest) {
		this.instancesService.searchInstances(searchRequest).subscribe(
			instances => {
				this.instances = instances;
				this.isSearching = false;
				this.isLoading = false;
				this.initialSearchRequest = searchRequest;
			},
			err => {
				this.searchRequestsService.addSearchRequest(SEARCH_KEY, this.initialSearchRequest);
				this.isSearching = false;
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to search instances', MCNotificationType.Error, err);
			}
		);
	}

  private loadInstances() {
	  let searchRequest = this.searchRequestsService.getSearchRequest(SEARCH_KEY);
	  this.initialSearchRequest = searchRequest;
	  if (searchRequest) {
		  this.searchInstances(searchRequest);
	  } else {
		  this.instancesService.getInstancesForMyOrg(false).subscribe(
			  instances => {
				  this.instances = instances;
				  this.isLoading = false;
			  },
			  err => {
				  this.isLoading = false;
				  this.notifications.generateNotification('Error', 'Error when trying to get instances', MCNotificationType.Error, err);
			  }
		  );
	  }
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

  private gotoInstance(index:number) {
    this.router.navigate([this.instances[index].instanceId], {queryParams: { instanceVersion: this.instances[index].version}, relativeTo: this.route })
  }

}
