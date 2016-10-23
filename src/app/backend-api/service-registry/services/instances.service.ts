import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ApiHelperService} from "../../shared/api-helper.service";
import {AuthService} from "../../../authentication/services/auth.service";
import {ServiceinstanceresourceApi} from "../autogen/api/ServiceinstanceresourceApi";
import {Instance} from "../autogen/model/Instance";

@Injectable()
export class InstancesService implements OnInit {
  private chosenInstance: Instance;
  constructor(private apiHelper: ApiHelperService, private instancesApi: ServiceinstanceresourceApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public getInstancesForMyOrg(): Observable<Array<Instance>> {
    let shortName = this.authService.authState.orgShortName;
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.instancesApi, true).subscribe(res => {
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
    });
  }

  public getInstancesForDesign(designId:string, version?:string): Observable<Array<Instance>> {
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.instancesApi, true).subscribe(res => {
        // TODO for now just get all instances. Needs to be for this design only though
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
    });
  }

  public getInstancesForSpecification(specificationId:string, version?:string): Observable<Array<Instance>> {
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.instancesApi, true).subscribe(res => {
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

    // TODO - for now we always need a version so just do a default. Should change in next update though
    if (!version) {
      version = '1';
    }

    return Observable.create(observer => {
      this.apiHelper.prepareService(this.instancesApi, true).subscribe(res => {
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
    });
  }

  // TODO delete this again, when description is part of the json
  private getDescription(instance:Instance):string {
    try {
      if (!instance || !instance.instanceAsXml) {
        return '';
      }
      var parser = new DOMParser();
      // TODO: this should change to non-base64 string with next service-registry update
      let xmlString =  window.atob(instance.instanceAsXml.content.toString());
      var xmlData = parser.parseFromString(xmlString, "application/xml");

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
    } catch ( error ) {
      return '';
    }
  }
}
