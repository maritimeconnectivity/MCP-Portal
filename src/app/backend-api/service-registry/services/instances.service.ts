import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {AuthService} from "../../../authentication/services/auth.service";
import {ServiceinstanceresourceApi} from "../autogen/api/ServiceinstanceresourceApi";
import {Instance} from "../autogen/model/Instance";
import {XmlresourceApi} from "../autogen/api/XmlresourceApi";
import {XmlParserService} from "../../../shared/xml-parser.service";
import {DocresourceApi} from "../autogen/api/DocresourceApi";

@Injectable()
export class InstancesService implements OnInit {
  private chosenInstance: Instance;
  constructor(private instancesApi: ServiceinstanceresourceApi, private xmlApi: XmlresourceApi, private docApi: DocresourceApi, private authService: AuthService, private xmlParser: XmlParserService) {
  }

  ngOnInit() {

  }

  public deleteInstance(instance:Instance) : Observable<{}> {
    this.chosenInstance = null;
    return this.instancesApi.deleteInstanceUsingDELETE(instance.instanceId, instance.version);
  }

  public createInstance(instance:Instance):Observable<Instance> {
    // TODO: add comments
    instance.comment = '';
    instance.instanceAsXml.comment = '';
    return Observable.create(observer => {
      // TODO fthis is just stupid. For now you need to create the xml and doc first and then the instance
      this.xmlApi.createXmlUsingPOST(instance.instanceAsXml).subscribe(
        xml => {
          instance.instanceAsXml = xml;
          if (instance.instanceAsDoc) {
            this.createWithDoc(instance, observer);
          } else {
            this.createActualInstance(instance, observer);
          }
        },
        err => {
          observer.error(err);
        }
      );
    });
  }
  private createWithDoc(instance:Instance, observer:Observer<any>) {
    instance.instanceAsDoc.comment = '';
    this.docApi.createDocUsingPOST(instance.instanceAsDoc).subscribe(
      doc => {
        instance.instanceAsDoc= doc;
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
        observer.next(createdInstance);
      },
      err => {
        observer.error(err);
      }
    );
  }

  public getInstancesForMyOrg(): Observable<Array<Instance>> {
    let orgMrn = this.authService.authState.orgMrn;
    // TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
    return Observable.create(observer => {
      // TODO for now just get all instances. Needs to be for this org only though
      this.instancesApi.getAllInstancesUsingGET().subscribe(
        instances => {
          // TODO delete this again, when description is part of the json
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

  public getInstancesForDesign(designId:string, version?:string): Observable<Array<Instance>> {
    return Observable.create(observer => {
      // TODO for now just get all instances and filter myself until the api can do it
      this.instancesApi.getAllInstancesUsingGET().subscribe(
        instances => {
          var instancesFiltered: Array<Instance> = [];
          for (let instance of instances) {
            let implementedDesignId = this.xmlParser.getVauleFromEmbeddedField('implementsServiceDesign', 'id', instance.instanceAsXml);
            if (implementedDesignId === designId) {
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

  public getInstancesForSpecification(specificationId:string, version?:string): Observable<Array<Instance>> {
    // TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
    return Observable.create(observer => {
      // TODO for now just get all instances. Needs to be for this specification only though
      this.instancesApi.getAllInstancesUsingGET().subscribe(
        instances => {
          // TODO delete this again, when description is part of the json
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
      this.instancesApi.getInstanceUsingGET(instanceId,version).subscribe(
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
        return '';
      }
      var parser = new DOMParser();
      // FIXME DID IT WORK: this should change to non-base64 string with next service-registry update
      let xmlString =  instance.instanceAsXml.content;
      var xmlData = parser.parseFromString(xmlString, instance.instanceAsXml.contentContentType);

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
    } catch ( error ) {
      return '';
    }
  }
}
