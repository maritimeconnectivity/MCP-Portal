import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {XsdresourceApi} from "../autogen/api/XsdresourceApi";
import {Xsd} from "../autogen/model/Xsd";


@Injectable()
export class XsdsService implements OnInit {
  constructor(private xsdsApi: XsdresourceApi) {
  }

  ngOnInit() {

  }

  public getXsds() : Observable<Array<Xsd>> {
  	return this.xsdsApi.getAllXsdsUsingGET();
  }
}
