import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Http} from "@angular/http";
import {EndorsecontrollerApi} from "./autogen/api/EndorsecontrollerApi";

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
			  return new EndorsecontrollerApi(http, ENDORSEMENT_BASE_PATH, null);
		  },
		  deps: [Http]
	  }
  ]
})
export class EndorsementApiModule { }
