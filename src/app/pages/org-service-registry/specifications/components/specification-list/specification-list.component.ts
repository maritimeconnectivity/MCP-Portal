import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {SpecificationsService} from "../../../../../backend-api/service-registry/services/specifications.service";
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {Router, ActivatedRoute} from "@angular/router";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {ServiceRegistrySearchRequest} from "../../../../shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {SrSearchRequestsService} from "../../../shared/services/sr-search-requests.service";

const SEARCH_KEY = 'SpecificationListComponent';
@Component({
  selector: 'specification-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-list.html'),
  styles: []
})
export class SpecificationListComponent implements OnInit {
	public searchKey = SEARCH_KEY;
	public isSearching = false;
	public organization: Organization;
  public specifications: Array<Specification>;
  public isLoading: boolean;
  public onCreate: Function;
  public onGotoSpec: Function;
	public cardTitle:string;
	private initialSearchRequest: ServiceRegistrySearchRequest;
  constructor(private searchRequestsService:SrSearchRequestsService, private navigationService: NavigationHelperService, private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private orgService: OrganizationsService, private specificationsService: SpecificationsService) {
  }

  ngOnInit() {
	  this.cardTitle = 'Specifications';
    this.onCreate = this.createSpecification.bind(this);
    this.onGotoSpec = this.gotoSpecification.bind(this);

    this.isLoading = true;
	  this.loadMyOrganization();
    this.loadSpecifications();
  }

  public search(searchRequest: ServiceRegistrySearchRequest) {
  	this.isSearching = true;
  	this.searchSpecifications(searchRequest);
  }

  private searchSpecifications(searchRequest: ServiceRegistrySearchRequest) {
	  this.specificationsService.searchSpecifications(searchRequest).subscribe(
		  specifications => {
			  this.specifications = specifications;
			  this.isSearching = false;
			  this.isLoading = false;
			  this.initialSearchRequest = searchRequest;
		  },
		  err => {
			  this.searchRequestsService.addSearchRequest(SEARCH_KEY, this.initialSearchRequest);
			  this.isSearching = false;
			  this.isLoading = false;
			  this.notifications.generateNotification('Error', 'Error when trying to search specifications', MCNotificationType.Error, err);
		  }
	  );
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

  private loadSpecifications() {
  	let searchRequest = this.searchRequestsService.getSearchRequest(SEARCH_KEY);
  	this.initialSearchRequest = searchRequest;
  	if (searchRequest) {
  		this.searchSpecifications(searchRequest);
	  } else {
	    this.specificationsService.getSpecificationsForMyOrg().subscribe(
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
  }

  private createSpecification() {
    this.navigationService.navigateToCreateSpecification();
  }

  private gotoSpecification(index:number) {
    this.router.navigate([this.specifications[index].specificationId], {queryParams: { specificationVersion: this.specifications[index].version}, relativeTo: this.route })
  }

}
