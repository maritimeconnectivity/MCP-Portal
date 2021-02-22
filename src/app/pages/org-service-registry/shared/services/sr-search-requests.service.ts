import { Injectable } from '@angular/core';
import { ServiceRegistrySearchRequest } from "../../../shared/components/service-registry-search/ServiceRegistrySearchRequest";

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
