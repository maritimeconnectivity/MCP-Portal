import {Injectable, OnInit} from '@angular/core';
import {Observable, Observer} from "rxjs";
import {AuthService} from "../../../authentication/services/auth.service";
import {ServicespecificationresourceApi} from "../autogen/api/ServicespecificationresourceApi";
import {Specification} from "../autogen/model/Specification";
import {XmlresourceApi} from "../autogen/api/XmlresourceApi";
import {Design} from "../autogen/model/Design";
import {XmlParserService} from "../../../shared/xml-parser.service";
import {DocresourceApi} from "../autogen/api/DocresourceApi";

@Injectable()
export class SpecificationsService implements OnInit {
  private chosenSpecification: Specification;
  constructor(private specificationsApi: ServicespecificationresourceApi, private xmlApi: XmlresourceApi, private docApi: DocresourceApi, private authService: AuthService, private xmlParser: XmlParserService) {
  }

  ngOnInit() {

  }

  public deleteSpecification(specification:Specification) : Observable<{}> {
    return this.specificationsApi.deleteSpecificationUsingDELETE(specification.specificationId, specification.version);
  }

  public createSpecification(specification:Specification):Observable<Specification> {
    // TODO: add comments
    specification.comment = '';
    specification.specAsXml.comment = '';
    return Observable.create(observer => {
      // TODO fthis is just stupid. For now you need to create the xml and doc first and then the specification
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
        observer.next(createdSpecification);
      },
      err => {
        observer.error(err);
      }
    );
  }

  public getSpecificationsForDesign(design:Design): Observable<Array<Specification>> {
    return Observable.create(observer => {
      // TODO for now just get one specification. In theory there could be more though
      let specificationId = this.xmlParser.getVauleFromEmbeddedField('designsServiceSpecifications', 'id', design.designAsXml);
      let version = this.xmlParser.getVauleFromEmbeddedField('designsServiceSpecifications', 'version', design.designAsXml);
      this.specificationsApi.getSpecificationUsingGET(specificationId, version).subscribe(
        specification => {
          observer.next([specification]);
        },
        err => {
          if (err.status == 404) {
            observer.next([]);
          } else {
            observer.error(err);
          }
        }
      );
    });
  }

  public getSpecificationsForMyOrg(): Observable<Array<Specification>> {
    let orgMrn = this.authService.authState.orgMrn;
    // TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
    return Observable.create(observer => {
      // TODO for now just get all specifications. Needs to be for this org only though.
      // TODO as soon as the data in service registry organizationId is updated, I need to filter out all data that not belongs to this org, because the portal is for now only for the organizations own data. other orgs data comes in face 2
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
        return '';
      }
      var parser = new DOMParser();
      // FIXME DID IT WORK: this should change to non-base64 string with next service-registry update
      let xmlString =  specification.specAsXml.content;
      var xmlData = parser.parseFromString(xmlString, specification.specAsXml.contentContentType);

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
    } catch ( error ) {
      return '';
    }
  }
}
