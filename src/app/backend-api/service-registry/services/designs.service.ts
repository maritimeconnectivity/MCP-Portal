import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ApiHelperService} from "../../shared/api-helper.service";
import {AuthService} from "../../../authentication/services/auth.service";
import {TechnicaldesignresourceApi} from "../autogen/api/TechnicaldesignresourceApi";
import {Design} from "../autogen/model/Design";

@Injectable()
export class DesignsService implements OnInit {
  public chosenDesign: Design;
  constructor(private apiHelper: ApiHelperService, private designsApi: TechnicaldesignresourceApi, private authService: AuthService) {
  }

  ngOnInit() {

  }

  public getDesignsForMyOrg(): Observable<Array<Design>> {
    let shortName = this.authService.authState.orgShortName;
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.designsApi, true).subscribe(res => {
        // TODO for now just get all designs. Needs to be for this org only though
        this.designsApi.getAllDesignsUsingGET().subscribe(
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
    });
  }

  public getDesignsForSpecification(specificationId:string, version?:string): Observable<Array<Design>> {
    return Observable.create(observer => {
      this.apiHelper.prepareService(this.designsApi, true).subscribe(res => {
        // TODO for now just get all designs. Needs to be for this specification only though
        this.designsApi.getAllDesignsUsingGET().subscribe(
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
    });
  }

  public getDesign(designId:string, version?:string): Observable<Design> {
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
    if (found) {
      return Observable.of(this.chosenDesign);
    }

    // TODO - for now we always need a version so just do a default. Should change in next update though
    if (!version) {
      version = '1';
    }

    return Observable.create(observer => {
      this.apiHelper.prepareService(this.designsApi, true).subscribe(res => {
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
    });
  }

  // TODO delete this again, when description is part of the json
  private getDescription(design:Design):string {
    try {
      if (!design || !design.designAsXml) {
        return '';
      }
      var parser = new DOMParser();
      // TODO: this should change to non-base64 string with next service-registry update
      let xmlString =  window.atob(design.designAsXml.content.toString());
      var xmlData = parser.parseFromString(xmlString, "application/xml");

      return xmlData.getElementsByTagName('description')[0].childNodes[0].nodeValue;
    } catch ( error ) {
      return '';
    }
  }
}
