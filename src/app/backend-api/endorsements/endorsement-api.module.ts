import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Http} from "@angular/http";
import {EndorsecontrollerApi} from "./autogen/api/EndorsecontrollerApi";
import { AppConfig } from '../../app.config';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [
	  {
		  provide: EndorsecontrollerApi,
		  useFactory: (http: Http) => {
			  return new EndorsecontrollerApi(http, AppConfig.ENDORSEMENT_BASE_PATH, null);
		  },
		  deps: [Http]
	  }
  ]
})
export class EndorsementApiModule { }
