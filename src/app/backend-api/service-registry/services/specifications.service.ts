import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {AuthService} from "../../../authentication/services/auth.service";
import {ServicespecificationresourceApi} from "../autogen/api/ServicespecificationresourceApi";
import {Specification} from "../autogen/model/Specification";

@Injectable()
export class SpecificationsService implements OnInit {
  private chosenSpecification: Specification;
  constructor(private specificationsApi: ServicespecificationresourceApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public createSpecification(specification:Specification):Observable<Specification>{
    return this.specificationsApi.createSpecificationUsingPOST(specification);
  }

  public getSpecificationsForMyOrg(): Observable<Array<Specification>> {
    let orgMrn = this.authService.authState.orgMrn;
    // TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
    return Observable.create(observer => {
      // TODO for now just get all specifications. Needs to be for this org only though.
      // TODO as soon as the data in service registry organisationId is updated, I need to filter out all data that not belongs to this org, because the portal is for now only for the organizations own data. other orgs data comes in face 2
      this.specificationsApi.getAllSpecificationsUsingGET().subscribe(
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

    // TODO - for now we always need a version so just do a default. Should change in next update though
    if (!version) {
      version = '1';
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
        return '';
      }
      var parser = new DOMParser();
      // TODO: this should change to non-base64 string with next service-registry update
      let xmlString =  window.atob(specification.specAsXml.content.toString());
      var xmlData = parser.parseFromString(xmlString, specification.specAsXml.contentContentType);

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
    } catch ( error ) {
      return '';
    }
  }
}
