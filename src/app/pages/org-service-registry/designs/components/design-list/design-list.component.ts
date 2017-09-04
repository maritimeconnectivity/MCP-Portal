import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {OrganizationsService} from "../../../../../backend-api/identity-registry/services/organizations.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {Organization} from "../../../../../backend-api/identity-registry/autogen/model/Organization";
import {Router, ActivatedRoute} from "@angular/router";
import {DesignsService} from "../../../../../backend-api/service-registry/services/designs.service";
import {Design} from "../../../../../backend-api/service-registry/autogen/model/Design";
import {ServiceRegistrySearchRequest} from "../../../../shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {SrSearchRequestsService} from "../../../shared/services/sr-search-requests.service";

const SEARCH_KEY = 'DesignListComponent';

@Component({
  selector: 'design-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./design-list.html'),
  styles: []
})
export class DesignListComponent implements OnInit {
	public searchKey = SEARCH_KEY;
	private initialSearchRequest: ServiceRegistrySearchRequest;
	public isSearching = false;
  public organization: Organization;
  public designs: Array<Design>;
  public isLoading: boolean;
  public onGotoDesign: Function;
	public cardTitle:string;
  constructor(private searchRequestsService:SrSearchRequestsService, private route: ActivatedRoute, private router: Router, private notifications: MCNotificationsService, private orgService: OrganizationsService, private designsService: DesignsService) {
  }

  ngOnInit() {
	  this.cardTitle = 'Technical Designs';
    this.onGotoDesign = this.gotoDesign.bind(this);

    this.isLoading = true;
    this.loadMyOrganization();
    this.loadDesigns();
  }

	public search(searchRequest: ServiceRegistrySearchRequest) {
		this.isSearching = true;
		this.searchDesigns(searchRequest);
	}

	private searchDesigns(searchRequest: ServiceRegistrySearchRequest) {
		this.designsService.searchDesigns(searchRequest).subscribe(
			designs => {
				this.designs = designs;
				this.isSearching = false;
				this.isLoading = false;
				this.initialSearchRequest = searchRequest;
			},
			err => {
				this.searchRequestsService.addSearchRequest(SEARCH_KEY, this.initialSearchRequest);
				this.isSearching = false;
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to search designs', MCNotificationType.Error, err);
			}
		);
	}

  private loadDesigns() {
	  let searchRequest = this.searchRequestsService.getSearchRequest(SEARCH_KEY);
	  this.initialSearchRequest = searchRequest;
	  if (searchRequest) {
		  this.searchDesigns(searchRequest);
	  } else {
		  this.designsService.getDesignsForMyOrg().subscribe(
			  designs => {
				  this.designs = designs;
				  this.isLoading = false;
			  },
			  err => {
				  this.isLoading = false;
				  this.notifications.generateNotification('Error', 'Error when trying to get designs', MCNotificationType.Error, err);
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

  private gotoDesign(index:number) {
    this.router.navigate([this.designs[index].designId], {queryParams: { designVersion: this.designs[index].version}, relativeTo: this.route })
  }

}
