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

@Injectable()
export class InstancesService implements OnInit {
  private chosenInstance: Instance;
  constructor(private docsService:DocsService, private xmlsService:XmlsService, private instancesApi: ServiceinstanceresourceApi, private xmlApi: XmlresourceApi, private docApi: DocresourceApi, private xmlParser: InstanceXmlParser) {
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

		parallelObservables.push(this.updateOrCreateXml(updateXml?instance.instanceAsXml:null).take(1));
		parallelObservables.push(this.updateOrCreateDoc(updateDoc?instance.instanceAsDoc:null).take(1));

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

	private updateOrCreateDoc(doc:Doc) : Observable<Doc> {
		if (!doc) {
			return Observable.of(null);
		} else if (doc.id) { // If doc has an ID then it has already been created and needs only update
			return this.docsService.updateDoc(doc);
		} else {
			return this.docsService.createDoc(doc);
		}
	}

	private updateOrCreateXml(xml:Xml) : Observable<Xml> {
		if (!xml) {
			return Observable.of(null);
		} else if (xml.id) { // If xml has an ID then it has already been created and needs only update
			return this.xmlsService.updateXml(xml);
		} else {
			return this.xmlsService.createXml(xml);
		}
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
	      this.chosenInstance = createdInstance;
        observer.next(createdInstance);
      },
      err => {
        observer.error(err);
      }
    );
  }

  public getAllInstances(): Observable<Array<Instance>> {
    // TODO I only create a new observable because I need to manipulate the response to get the description. If that is not needed anymore, i can just do a simple return of the call to the api, without subscribe
    return Observable.create(observer => {
	    // TODO FIXME Hotfix. This pagination should be done the right way
      this.instancesApi.getAllInstancesUsingGET(0, 100).subscribe(
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
	    // TODO FIXME Hotfix. This pagination should be done the right way
	    let query = QueryHelper.generateQueryStringForDesign(designId, version);
	    this.instancesApi.searchInstancesUsingGET(query,0,100).subscribe(
		    instances => {
			    var instancesFiltered: Array<Instance> = [];
			    for (let instance of instances) {
				    let implementedDesignId = this.xmlParser.getMrnForDesignInInstance(instance.instanceAsXml);
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
      this.instancesApi.getAllInstancesUsingGET(0,100).subscribe(
        instances => {
          var instancesFiltered: Array<Instance> = [];
          for (let instance of instances) {
	          let implementedDesignId = this.xmlParser.getMrnForDesignInInstance(instance.instanceAsXml);
	          let implementedDesignVersion = this.xmlParser.getVersionForDesignInInstance(instance.instanceAsXml);
	          var versionOK = true;
	          if (version) {
	          	versionOK = implementedDesignVersion === version;
	          }
            if (implementedDesignId === designId && versionOK) {
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
