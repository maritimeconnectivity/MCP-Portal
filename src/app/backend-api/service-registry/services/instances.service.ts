import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {ServiceinstanceresourceApi} from "../autogen/api/ServiceinstanceresourceApi";
import {Instance} from "../autogen/model/Instance";
import {XmlresourceApi} from "../autogen/api/XmlresourceApi";
import {DocresourceApi} from "../autogen/api/DocresourceApi";
import {Doc} from "../autogen/model/Doc";
import {InstanceXmlParser} from "../../../pages/org-service-registry/shared/services/instance-xml-parser.service";
import {DocsService} from "./docs.service";
import {XmlsService} from "./xmls.service";
import {Xml} from "../autogen/model/Xml";
import {QueryHelper} from "./query-helper";
import {SortingHelper} from "../../shared/SortingHelper";
import {ServiceRegistrySearchRequest} from "../../../pages/shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {EndorsementSearchResult, EndorsementsService} from "../../endorsements/services/endorsements.service";
import {Endorsement} from "../../endorsements/autogen/model/Endorsement";
import {AuthService} from "../../../authentication/services/auth.service";
import {PortalUserError, UserError} from "../../../shared/UserError";

@Injectable()
export class InstancesService implements OnInit {
  private chosenInstance: Instance;
  constructor(private xmlInstanceParser: InstanceXmlParser, private authService: AuthService, private endorsementsService:EndorsementsService, private docsService:DocsService, private xmlsService:XmlsService, private instancesApi: ServiceinstanceresourceApi, private xmlApi: XmlresourceApi, private docApi: DocresourceApi, private xmlParser: InstanceXmlParser) {
  }

  ngOnInit() {

  }

	public updateStatus(instance:Instance, newStatus:string) : Observable<{}> {
		this.chosenInstance = null;
		return this.instancesApi.updateInstanceStatusUsingPUT(instance.instanceId, instance.version, newStatus);
	}

	public updateInstance(instance:Instance, updateDoc:boolean, updateXml:boolean) : Observable<{}> {
		this.chosenInstance = null;
		let parallelObservables = [];

		parallelObservables.push(this.xmlsService.updateOrCreateXml(updateXml?instance.instanceAsXml:null).take(1));
		parallelObservables.push(this.docsService.updateOrCreateDoc(updateDoc?instance.instanceAsDoc:null).take(1));

		return Observable.forkJoin(parallelObservables).flatMap(
			resultArray => {
				let xml:Xml = resultArray[0];
				let doc:Doc = resultArray[1];

				var shouldUpdateInstance = false;
				if (doc) {
					if (instance.instanceAsDoc) {
						shouldUpdateInstance = instance.instanceAsDoc.id !== doc.id; // update the instance if the id isn't the same
					} else { // No doc before, but one now, so we need to update instance
						shouldUpdateInstance = true;
					}
					instance.instanceAsDoc = doc;
				}

				if (xml) { // If xml has changed we need to update the instance
					instance.instanceAsXml = xml;
					shouldUpdateInstance = true;
				}

				if (shouldUpdateInstance) {
					return this.instancesApi.updateInstanceUsingPUT(instance);
				} else {
					return Observable.of({});
				}
			});
	}

  public deleteInstance(instance:Instance) : Observable<{}> {
    this.chosenInstance = null;
    return this.instancesApi.deleteInstanceUsingDELETE(instance.instanceId, instance.version);
  }

  public createInstance(instance:Instance, instanceDoc?:Doc):Observable<Instance> {
    // TODO: add comments
    instance.comment = '';
    instance.instanceAsXml.comment = '';
    return Observable.create(observer => {
    	this.getInstance(instance.instanceId, instance.version).subscribe(ins => {
			    observer.error(new PortalUserError('Instance already exists with same MRN and version.'));
	      },
		    err => {
			    if (err.status == 404) { // The instance doesn't exist - create it
				    // TODO The api is a bit strange. For now you need to create the xml and doc first and then the instance
				    this.xmlApi.createXmlUsingPOST(instance.instanceAsXml).subscribe(
					    xml => {
						    instance.instanceAsXml = xml;
						    if (instanceDoc) {
							    this.createWithDoc(instance, instanceDoc, observer);
						    } else {
							    this.createActualInstance(instance, observer);
						    }
					    },
					    err => {
						    observer.error(err);
					    }
				    );
			    } else {
				    observer.error(err);
			    }
		    }
	    );
    });
  }
  private createWithDoc(instance:Instance, instanceDoc:Doc, observer:Observer<any>) {
	  instanceDoc.comment = '';
    this.docApi.createDocUsingPOST(instanceDoc).subscribe(
      doc => {
      	instance.instanceAsDoc = doc;
        this.createActualInstance(instance, observer);
      },
      err => {
        observer.error(err);
      }
    );
  }
  private createActualInstance(instance:Instance, observer:Observer<any>) {
    this.instancesApi.createInstanceUsingPOST(instance).subscribe(
      createdInstance => {
	      createdInstance.description = this.getDescription(createdInstance);
	      this.chosenInstance = createdInstance;
        observer.next(createdInstance);
      },
      err => {
        observer.error(err);
      }
    );
  }

	public getInstancesForMyOrg(): Observable<Array<Instance>> {
		let searchRequest:ServiceRegistrySearchRequest = {keywords:'',registeredBy:this.authService.authState.orgMrn,endorsedBy:null}

		return this.getInstances(searchRequest);
	}

	public searchInstances(searchRequest:ServiceRegistrySearchRequest): Observable<Array<Instance>> {
		let parallelObservables = [];

		// TODO: When paging is done, this should not be in parallel. The endorsements should be retrieved first and then the result should be used to make a query=Id=<firstId> OR id=<secondId> OR ...
		parallelObservables.push(this.getInstances(searchRequest).take(1));
		parallelObservables.push(this.endorsementsService.searchEndorsementsForInstances(searchRequest).take(1));

		return Observable.forkJoin(parallelObservables).flatMap(
			resultArray => {
				let instances:any = resultArray[0];
				let endorsementResult:any = resultArray[1];
				return this.combineSearchResult(instances,endorsementResult);
			});
	}

	public searchInstancesForDesign(searchRequest:ServiceRegistrySearchRequest, designId:string, designVersion:string): Observable<Array<Instance>> {
		if (!searchRequest) {
			return this.getInstancesForDesign(designId, designVersion);
		}

		let parallelObservables = [];
		// TODO: When paging is done, this should not be in parallel. The endorsements should be retrieved first and then the result should be used to make a query=id=<firstId> OR id=<secondId> OR ...
		parallelObservables.push(this.searchAndFilterInstancesForDesign(searchRequest, designId, designVersion).take(1));
		parallelObservables.push(this.endorsementsService.searchEndorsementsForInstances(searchRequest, designId, designVersion).take(1));

		return Observable.forkJoin(parallelObservables).flatMap(
			resultArray => {
				let instances:any = resultArray[0];
				let endorsementResult:any = resultArray[1];
				return this.combineSearchResult(instances,endorsementResult);
			});
	}

	private searchAndFilterInstancesForDesign(searchRequest:ServiceRegistrySearchRequest, designId:string, designVersion?:string): Observable<Array<Instance>> {
		return Observable.create(observer => {
			let querySearch = QueryHelper.generateQueryStringForRequest(searchRequest);
			let queryDesign = QueryHelper.generateQueryStringForDesign(designId);
			var query = queryDesign;
			if (querySearch.length > 0) {
				query = QueryHelper.combineQueryStringsWithAnd([querySearch,queryDesign]);
			}
			// TODO FIXME Hotfix. This pagination should be done the right way
			let sort = SortingHelper.sortingForInstances();
			this.instancesApi.searchInstancesUsingGET(query,0,100,undefined,undefined,sort).subscribe(
				instances => {
					var instancesFiltered: Array<Instance> = [];
					for (let instance of instances) {
						instance.description = this.getDescription(instance);
						if (designVersion) {
							let designXmlVersion = this.xmlInstanceParser.getVersionForDesignInInstance(instance.instanceAsXml);
							if (designVersion === designXmlVersion) {
								instancesFiltered.push(instance);
							}
						} else {
							instancesFiltered.push(instance);
						}
					}
					observer.next(instancesFiltered);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	private combineSearchResult(instances:Array<Instance>, endorsementResult:EndorsementSearchResult) : Observable<Array<Instance>> {
		if (endorsementResult.shouldFilter) {
			instances = this.filterInstances(instances, endorsementResult.pageEndorsement.content);
		}
		return Observable.of(instances);
	}

	private filterInstances(instances:Array<Instance>, endorsements:Array<Endorsement>) : Array<Instance> {
		let filteredInstances: Array<Instance> = [];
		instances.forEach(instance => {
			for (let endorsement of endorsements){
				if (instance.instanceId === endorsement.serviceMrn) {
					filteredInstances.push(instance);
					break;
				}
			}
		});
		return filteredInstances;
	}

	private getInstances(searchRequest:ServiceRegistrySearchRequest): Observable<Array<Instance>> {
		// TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
		return Observable.create(observer => {
			// TODO FIXME Hotfix. This pagination should be done the right way
			let query = QueryHelper.generateQueryStringForRequest(searchRequest);
			let sort = SortingHelper.sortingForInstances();
			this.instancesApi.searchInstancesUsingGET(query,0,100,undefined,undefined,sort).subscribe(
				instances => {
					for (let instance of instances) {
						instance.description = this.getDescription(instance);
					}
					observer.next(instances);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

  private getInstancesForDesign(designId:string, designVersion?:string): Observable<Array<Instance>> {
    return Observable.create(observer => {
	    // TODO FIXME Hotfix. This pagination should be done the right way
	    let query = QueryHelper.generateQueryStringForDesign(designId);
	    let sort = SortingHelper.sortingForInstances();
	    this.instancesApi.searchInstancesUsingGET(query,0,100,undefined,undefined,sort).subscribe(
		    instances => {
			    var instancesFiltered: Array<Instance> = [];
			    for (let instance of instances) {
				    let implementedDesignVersion = this.xmlParser.getVersionForDesignInInstance(instance.instanceAsXml);

				    if (implementedDesignVersion === designVersion) {
					    instance.description = this.getDescription(instance);
					    instancesFiltered.push(instance);
				    }
			    }
			    observer.next(instancesFiltered);
		    },
		    err => {
			    observer.error(err);
		    }
	    );
    });
  }

  public getInstance(instanceId:string, version?:string): Observable<Instance> {
    var found = false;
    if (this.chosenInstance && this.chosenInstance.instanceId === instanceId) {
      if (version) {
        if (this.chosenInstance.version === version) {
          found = true;
        }
      } else {
        found = true;
      }
    }
    if (found) {
      return Observable.of(this.chosenInstance);
    }

    if (!version) {
      version = 'latest';
    }

    // We create a new observable because we need to save the response for simple caching
    return Observable.create(observer => {
      this.instancesApi.getInstanceUsingGET(instanceId,version, "true").subscribe(
        instance => {
          // TODO delete this again, when description is part of the json
          instance.description = this.getDescription(instance);
          this.chosenInstance = instance;
          observer.next(instance);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  // TODO delete this again, when description is part of the json
  private getDescription(instance:Instance):string {
    try {
      if (!instance || !instance.instanceAsXml) {
	      console.log("PARSE ERROR: ", instance);
	      return 'Parse error';
      }
      var parser = new DOMParser();
      let xmlString =  instance.instanceAsXml.content;
      var xmlData = parser.parseFromString(xmlString, instance.instanceAsXml.contentContentType);

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
    } catch ( error ) {
      return '';
    }
  }
}
