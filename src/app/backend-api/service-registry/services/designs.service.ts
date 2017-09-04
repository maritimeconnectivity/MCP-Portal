import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {AuthService} from "../../../authentication/services/auth.service";
import {TechnicaldesignresourceApi} from "../autogen/api/TechnicaldesignresourceApi";
import {Design} from "../autogen/model/Design";
import {XmlresourceApi} from "../autogen/api/XmlresourceApi";
import {Instance} from "../autogen/model/Instance";
import {DocresourceApi} from "../autogen/api/DocresourceApi";
import {InstanceXmlParser} from "../../../pages/org-service-registry/shared/services/instance-xml-parser.service";
import {DesignXmlParser} from "../../../pages/org-service-registry/shared/services/design-xml-parser.service";
import {ServiceRegistrySearchRequest} from "../../../pages/shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {EndorsementsService, EndorsementSearchResult} from "../../endorsements/services/endorsements.service";
import {Endorsement} from "../../endorsements/autogen/model/Endorsement";
import {QueryHelper} from "./query-helper";
import {SortingHelper} from "../../shared/SortingHelper";
import {Xml} from "../autogen/model/Xml";
import {Doc} from "../autogen/model/Doc";
import {XmlsService} from "./xmls.service";
import {DocsService} from "./docs.service";
import {PortalUserError, UserError} from "../../../shared/UserError";


@Injectable()
export class DesignsService implements OnInit {
  private chosenDesign: Design;
  constructor(private docsService:DocsService, private xmlsService:XmlsService, private endorsementsService:EndorsementsService, private designsApi: TechnicaldesignresourceApi, private xmlApi: XmlresourceApi, private docApi: DocresourceApi, private authService: AuthService, private xmlInstanceParser: InstanceXmlParser, private xmlDesignParser: DesignXmlParser) {
  }

  ngOnInit() {

  }

	public updateStatus(design:Design, newStatus:string) : Observable<{}> {
		this.chosenDesign = null;
		return this.designsApi.updateDesignStatusUsingPUT(design.designId, design.version, newStatus, "default_auth");
	}

	public updateDesign(design:Design, updateDoc:boolean, updateXml:boolean) : Observable<{}> {
		this.chosenDesign = null;
		let parallelObservables = [];

		parallelObservables.push(this.xmlsService.updateOrCreateXml(updateXml?design.designAsXml:null).take(1));
		parallelObservables.push(this.docsService.updateOrCreateDoc(updateDoc?design.designAsDoc:null).take(1));

		return Observable.forkJoin(parallelObservables).flatMap(
			resultArray => {
				let xml:Xml = resultArray[0];
				let doc:Doc = resultArray[1];

				var shouldUpdateDesign = false;
				if (doc) {
					if (design.designAsDoc) {
						shouldUpdateDesign = design.designAsDoc.id !== doc.id; // update the design if the id isn't the same
					} else { // No doc before, but one now, so we need to update design
						shouldUpdateDesign = true;
					}
					design.designAsDoc = doc;
				}

				if (xml) { // If xml has changed we need to update the design
					design.designAsXml = xml;
					shouldUpdateDesign = true;
				}

				if (shouldUpdateDesign) {
					return this.designsApi.updateDesignUsingPUT(design, "default_auth");
				} else {
					return Observable.of({});
				}
			});
	}

	public searchDesigns(searchRequest:ServiceRegistrySearchRequest): Observable<Array<Design>> {
		let parallelObservables = [];

		// TODO: When paging is done, this should not be in parallel. The endorsements should be retrieved first and then the result should be used to make a query=specificationId=<firstId> OR specificationId=<secondId> OR ...
		parallelObservables.push(this.getDesigns(searchRequest).take(1));
		parallelObservables.push(this.endorsementsService.searchEndorsementsForDesigns(searchRequest).take(1));

		return Observable.forkJoin(parallelObservables).flatMap(
			resultArray => {
				let designs:any = resultArray[0];
				let endorsementResult:any = resultArray[1];
				return this.combineSearchResult(designs,endorsementResult);
			});
	}

	public getDesignsForMyOrg(): Observable<Array<Design>> {
		let searchRequest:ServiceRegistrySearchRequest = {keywords:'',registeredBy:this.authService.authState.orgMrn,endorsedBy:null}

		return this.getDesigns(searchRequest);
	}

	public searchDesignsForSpecification(searchRequest:ServiceRegistrySearchRequest, specificationId:string, specificationVersion:string): Observable<Array<Design>> {
		if (!searchRequest) {
			return this.getDesignsForSpecification(specificationId, specificationVersion);
		}

  	let parallelObservables = [];
		// TODO: When paging is done, this should not be in parallel. The endorsements should be retrieved first and then the result should be used to make a query=specificationId=<firstId> OR specificationId=<secondId> OR ...
		parallelObservables.push(this.searchAndFilterDesignsForSpecification(searchRequest, specificationId, specificationVersion).take(1));
		parallelObservables.push(this.endorsementsService.searchEndorsementsForDesigns(searchRequest, specificationId, specificationVersion).take(1));

		return Observable.forkJoin(parallelObservables).flatMap(
			resultArray => {
				let designs:any = resultArray[0];
				let endorsementResult:any = resultArray[1];
				return this.combineSearchResult(designs,endorsementResult);
			});
	}

	private combineSearchResult(designs:Array<Design>, endorsementResult:EndorsementSearchResult) : Observable<Array<Design>> {
		if (endorsementResult.shouldFilter) {
			designs = this.filterDesigns(designs, endorsementResult.pageEndorsement.content);
		}
		return Observable.of(designs);
	}

	private filterDesigns(designs:Array<Design>, endorsements:Array<Endorsement>) : Array<Design> {
		let filteredDesigns: Array<Design> = [];
		designs.forEach(design => {
			for (let endorsement of endorsements){
				if (design.designId === endorsement.serviceMrn) {
					filteredDesigns.push(design);
					break;
				}
			}
		});
		return filteredDesigns;
	}

	private getDesigns(searchRequest:ServiceRegistrySearchRequest): Observable<Array<Design>> {
		return Observable.create(observer => {
			// TODO FIXME Hotfix. This pagination should be done the right way
			let query = QueryHelper.generateQueryStringForRequest(searchRequest);
			let sort = SortingHelper.sortingForDesigns();
			this.designsApi.searchDesignsUsingGET(query,0,300, sort).subscribe(
				designs => {
					for (let design of designs) {
						design.description = this.getDescription(design);
					}
					observer.next(designs);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

	private getDesignsForSpecification(specificationId:string, specificationVersion?:string): Observable<Array<Design>> {
		return this.searchAndFilterDesignsForSpecification(null, specificationId, specificationVersion);
	}

  public deleteDesign(design:Design) : Observable<{}> {
    this.chosenDesign = null;
    return this.designsApi.deleteDesignUsingDELETE(design.designId, design.version, "default_auth");
  }

  public createDesign(design:Design):Observable<Design>{
    // TODO: add comments
    design.comment = '';
    design.designAsXml.comment = '';
    return Observable.create(observer => {
	    this.getDesign(design.designId, design.version).subscribe(des => {
			    observer.error(new PortalUserError('Design already exists with same MRN and version.'));
		    },
		    err => {
			    if (err.status == 404) { // The design doesn't exist - create it
				    // TODO The api is a bit strange. For now you need to create the xml and doc first and then the design
				    this.xmlApi.createXmlUsingPOST(design.designAsXml).subscribe(
					    xml => {
						    design.designAsXml = xml;
						    if (design.designAsDoc) {
							    this.createWithDoc(design, observer);
						    } else {
							    this.createActualDesign(design, observer);
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
  private createWithDoc(design:Design, observer:Observer<any>) {
    design.designAsDoc.comment = '';
    this.docApi.createDocUsingPOST(design.designAsDoc).subscribe(
      doc => {
        design.designAsDoc= doc;
        this.createActualDesign(design, observer);
      },
      err => {
        observer.error(err);
      }
    );
  }
  private createActualDesign(design:Design, observer:Observer<any>) {
    this.designsApi.createDesignUsingPOST(design, "default_auth").subscribe(
      createdDesign => {
	      createdDesign.description = this.getDescription(createdDesign);
	      this.chosenDesign = createdDesign;
        observer.next(createdDesign);
      },
      err => {
        observer.error(err);
      }
    );
  }

  public getDesignForInstance(instance:Instance): Observable<Design> {

	  let designId = this.xmlInstanceParser.getMrnForDesignInInstance(instance.instanceAsXml);
	  let version = this.xmlInstanceParser.getVersionForDesignInInstance(instance.instanceAsXml);
	  // TODO: change when data is actually there
	  //let designId = instance.designId;
	  //let version = instance.version;

	  if (this.isChosenDesign(designId, version)) {
		  return Observable.of(this.chosenDesign);
	  }

    return Observable.create(observer => {
      this.designsApi.getDesignUsingGET(designId, version).subscribe(
        design => {
          observer.next(design);
        },
        err => {
          if (err.status == 404) {
            observer.next(undefined);
          } else {
            observer.error(err);
          }
        }
      );
    });
  }

  private searchAndFilterDesignsForSpecification(searchRequest:ServiceRegistrySearchRequest, specificationId:string, specVersion?:string): Observable<Array<Design>> {
	   return Observable.create(observer => {
		   let querySearch = QueryHelper.generateQueryStringForRequest(searchRequest);
		   let querySpecification = QueryHelper.generateQueryStringForSpecification(specificationId);
		   var query = querySpecification;
		   if (querySearch.length > 0) {
			   query = QueryHelper.combineQueryStringsWithAnd([querySearch,querySpecification]);
		   }
		   // TODO FIXME Hotfix. This pagination should be done the right way
		   let sort = SortingHelper.sortingForDesigns();
		   this.designsApi.searchDesignsUsingGET(query,0,300, sort).subscribe(
			   designs => {
				   var designsFiltered: Array<Design> = [];
				   for (let design of designs) {
					   design.description = this.getDescription(design);
					   if (specVersion) {
						   let specificationVersion = this.xmlDesignParser.getVersionForSpecificationInDesign(design.designAsXml);
						   if (specVersion === specificationVersion) {
							   designsFiltered.push(design);
						   }
					   } else {
						   designsFiltered.push(design);
					   }
				   }
				   observer.next(designsFiltered);
			   },
			   err => {
				   observer.error(err);
			   }
		   );
	   });
  }

  public getDesign(designId:string, version?:string): Observable<Design> {
    if (this.isChosenDesign(designId, version)) {
      return Observable.of(this.chosenDesign);
    }

    if (!version) {
      version = 'latest';
    }

    // We create a new observable because we need to save the response for simple caching
    return Observable.create(observer => {
      this.designsApi.getDesignUsingGET(designId,version).subscribe(
        design => {
          // TODO delete this again, when description is part of the json
          design.description = this.getDescription(design);
          this.chosenDesign = design;
          observer.next(design);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  // TODO delete this again, when description is part of the json
  private getDescription(design:Design):string {
    try {
      if (!design || !design.designAsXml) {
      	console.log("PARSE ERROR: ", design);
        return 'Parse error';
      }


      return this.xmlDesignParser.getDescription(design.designAsXml);
    } catch ( error ) {
      return '';
    }
  }

  private isChosenDesign(designId:string, version?:string) : boolean{
	  var found = false;
	  if (this.chosenDesign && this.chosenDesign.designId === designId) {
		  if (version) {
			  if (this.chosenDesign.version === version) {
				  found = true;
			  }
		  } else {
			  found = true;
		  }
	  }
	  return found;
  }
}
