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


@Injectable()
export class DesignsService implements OnInit {
  private chosenDesign: Design;
  constructor(private endorsementsService:EndorsementsService, private designsApi: TechnicaldesignresourceApi, private xmlApi: XmlresourceApi, private docApi: DocresourceApi, private authService: AuthService, private xmlInstanceParser: InstanceXmlParser, private xmlDesignParser: DesignXmlParser) {
  }

  ngOnInit() {

  }

	public searchDesignsForSpecification(searchRequest:ServiceRegistrySearchRequest, specificationId:string, version?:string): Observable<Array<Design>> {
		if (!searchRequest) {
			return this.getDesignsForSpecification(specificationId, version);
		}

  	let parallelObservables = [];
		// TODO: When paging is done, this should not be in parallel. The endorsements should be retrieved first and then the result should be used to make a query=specificationId=<firstId> OR specificationId=<secondId> OR ...
		parallelObservables.push(this.searchAndFilterDesignsForSpecification(searchRequest, specificationId, version).take(1));
		parallelObservables.push(this.endorsementsService.searchEndorsementsForDesigns(searchRequest, specificationId).take(1));

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

	private getDesignsForSpecification(specificationId:string, specificationVersion?:string): Observable<Array<Design>> {
		return this.searchAndFilterDesignsForSpecification(null, specificationId, specificationVersion);
	}

  public deleteDesign(design:Design) : Observable<{}> {
    this.chosenDesign = null;
    return this.designsApi.deleteDesignUsingDELETE(design.designId, design.version);
  }

  public createDesign(design:Design):Observable<Design>{
    // TODO: add comments
    design.comment = '';
    design.designAsXml.comment = '';
    return Observable.create(observer => {
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
    this.designsApi.createDesignUsingPOST(design).subscribe(
      createdDesign => {
	      this.chosenDesign = createdDesign;
        observer.next(createdDesign);
      },
      err => {
        observer.error(err);
      }
    );
  }

  public getAllDesigns(): Observable<Array<Design>> {
    // TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
    return Observable.create(observer => {
	    // TODO FIXME Hotfix. This pagination should be done the right way
	    let sort = SortingHelper.sortingForDesigns();
      this.designsApi.getAllDesignsUsingGET(0, 100, sort).subscribe(
        designs => {
          // TODO delete this again, when description is part of the json
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
		   this.designsApi.searchDesignsUsingGET(query,0,100, sort).subscribe(
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
      var parser = new DOMParser();
      let xmlString =  design.designAsXml.content;
      var xmlData = parser.parseFromString(xmlString, design.designAsXml.contentContentType);

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
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
