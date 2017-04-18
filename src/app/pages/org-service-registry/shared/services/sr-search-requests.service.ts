import {Injectable, OnInit} from '@angular/core';
import {Specification} from "../../../../backend-api/service-registry/autogen/model/Specification";
import {LabelValueModel} from "../../../../theme/components/mcLabelValueTable/mcLabelValueTable.component";
import {Design} from "../../../../backend-api/service-registry/autogen/model/Design";
import {Instance} from "../../../../backend-api/service-registry/autogen/model/Instance";
import {ServiceRegistrySearchRequest} from "../../../shared/components/service-registry-search/ServiceRegistrySearchRequest";

@Injectable()
export class SrSearchRequestsService {
	private searchRequests: { [key: string]: ServiceRegistrySearchRequest } = {};
  constructor() {
  }

  // Returns null if none found
  public getSearchRequest(key:string) : ServiceRegistrySearchRequest {
  	return this.searchRequests[key];
	}

	public addSearchRequest(key:string, searchRequest:ServiceRegistrySearchRequest) {
  	this.searchRequests[key] = searchRequest;
	}
}
