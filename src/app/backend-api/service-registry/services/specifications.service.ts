import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {AuthService} from "../../../authentication/services/auth.service";
import {ServicespecificationresourceApi} from "../autogen/api/ServicespecificationresourceApi";
import {Specification} from "../autogen/model/Specification";
import {XmlresourceApi} from "../autogen/api/XmlresourceApi";
import {Design} from "../autogen/model/Design";
import {XmlParserService} from "../../../shared/xml-parser.service";
import {DocresourceApi} from "../autogen/api/DocresourceApi";
import {ServiceRegistrySearchRequest} from "../../../pages/shared/components/service-registry-search/ServiceRegistrySearchRequest";
import {QueryHelper} from "./query-helper";
import {EndorsementsService, EndorsementSearchResult} from "../../endorsements/services/endorsements.service";
import {forEach} from "@angular/router/src/utils/collection";
import {Endorsement} from "../../endorsements/autogen/model/Endorsement";
import {SortingHelper} from "../../shared/SortingHelper";

@Injectable()
export class SpecificationsService implements OnInit {
  private chosenSpecification: Specification;
  constructor(private endorsementsService:EndorsementsService, private specificationsApi: ServicespecificationresourceApi, private xmlApi: XmlresourceApi, private docApi: DocresourceApi, private authService: AuthService, private xmlParser: XmlParserService) {
  }

  ngOnInit() {

  }

  public deleteSpecification(specification:Specification) : Observable<{}> {
    this.chosenSpecification = null;
    return this.specificationsApi.deleteSpecificationUsingDELETE(specification.specificationId, specification.version);
  }

  public createSpecification(specification:Specification):Observable<Specification> {
    // TODO: add comments
    specification.comment = '';
    specification.specAsXml.comment = '';
    return Observable.create(observer => {
      // TODO The api is a bit strange. For now you need to create the xml and doc first and then the specification
      this.xmlApi.createXmlUsingPOST(specification.specAsXml).subscribe(
        xml => {
          specification.specAsXml = xml;
          if (specification.specAsDoc) {
            this.createWithDoc(specification, observer);
          } else {
            this.createActualSpecification(specification, observer);
          }
        },
        err => {
          observer.error(err);
        }
      );
    });
  }
  private createWithDoc(specification:Specification, observer:Observer<any>) {
    specification.specAsDoc.comment = '';
    this.docApi.createDocUsingPOST(specification.specAsDoc).subscribe(
      doc => {
        specification.specAsDoc = doc;
        this.createActualSpecification(specification, observer);
      },
      err => {
        observer.error(err);
      }
    );
  }
  private createActualSpecification(specification:Specification, observer:Observer<any>) {
    this.specificationsApi.createSpecificationUsingPOST(specification).subscribe(
      createdSpecification => {
	      createdSpecification.description = this.getDescription(createdSpecification);
	      this.chosenSpecification = createdSpecification;
        observer.next(createdSpecification);
      },
      err => {
        observer.error(err);
      }
    );
  }

	public getSpecificationsForMyOrg(): Observable<Array<Specification>> {
		let searchRequest:ServiceRegistrySearchRequest = {keywords:'',registeredBy:this.authService.authState.orgMrn,endorsedBy:null}

		return this.getSpecifications(searchRequest);
	}

	public searchSpecifications(searchRequest:ServiceRegistrySearchRequest): Observable<Array<Specification>> {
		let parallelObservables = [];

		// TODO: When paging is done, this should not be in parallel. The endorsements should be retrieved first and then the result should be used to make a query=specificationId=<firstId> OR specificationId=<secondId> OR ...
		parallelObservables.push(this.getSpecifications(searchRequest).take(1));
		parallelObservables.push(this.endorsementsService.searchEndorsementsForSpecifications(searchRequest).take(1));

		return Observable.forkJoin(parallelObservables).flatMap(
			resultArray => {
				let specifications:any = resultArray[0];
				let endorsementResult:any = resultArray[1];
				return this.combineSearchResult(specifications,endorsementResult);
			});
	}

	private combineSearchResult(specifications:Array<Specification>, endorsementResult:EndorsementSearchResult) : Observable<Array<Specification>> {
		if (endorsementResult.shouldFilter) {
			specifications = this.filterSpecifications(specifications, endorsementResult.pageEndorsement.content);
		}
		return Observable.of(specifications);
	}

	private filterSpecifications(specifications:Array<Specification>, endorsements:Array<Endorsement>) : Array<Specification> {
  	let filteredSpecifications: Array<Specification> = [];
  	specifications.forEach(specification => {
  		for (let endorsement of endorsements){
  			if (specification.specificationId === endorsement.serviceMrn) {
					filteredSpecifications.push(specification);
					break;
			  }
		  }
	  });
  	return filteredSpecifications;
	}

	private getSpecifications(searchRequest:ServiceRegistrySearchRequest): Observable<Array<Specification>> {
		// TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
		return Observable.create(observer => {
			// TODO FIXME Hotfix. This pagination should be done the right way
			let query = QueryHelper.generateQueryStringForRequest(searchRequest);
			let sort = SortingHelper.sortingForSpecifications();
			this.specificationsApi.searchSpecificationsUsingGET(query,0,100, sort).subscribe(
				specifications => {
					// TODO delete this again, when description is part of the json
					for (let specification of specifications) {
						specification.description = this.getDescription(specification);
					}
					observer.next(specifications);
				},
				err => {
					observer.error(err);
				}
			);
		});
	}

  public getSpecification(specificationId:string, version?:string): Observable<Specification> {
    var found = false;
    if (this.chosenSpecification && this.chosenSpecification.specificationId === specificationId) {
      if (version) {
        if (this.chosenSpecification.version === version) {
          found = true;
        }
      } else {
        found = true;
      }
    }
    if (found) {
      return Observable.of(this.chosenSpecification);
    }

    if (!version) {
      version = 'latest';
    }

    // We create a new observable because we need to save the response for simple caching
    return Observable.create(observer => {
      this.specificationsApi.getSpecificationUsingGET(specificationId,version).subscribe(
        specification => {
          // TODO delete this again, when description is part of the json
          specification.description = this.getDescription(specification);
          this.chosenSpecification = specification;
          observer.next(specification);
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  // TODO delete this again, when description is part of the json
  private getDescription(specification:Specification):string {
    try {
      if (!specification || !specification.specAsXml) {
	      console.log("PARSE ERROR: ", specification);
	      return 'Parse error';
      }
      var parser = new DOMParser();
      let xmlString =  specification.specAsXml.content;
      var xmlData = parser.parseFromString(xmlString, specification.specAsXml.contentContentType);

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
    } catch ( error ) {
      return '';
    }
  }
}
