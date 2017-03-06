import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Http} from "@angular/http";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  providers: [
	  /*{
		  provide: something,
		  useFactory: (http: Http) => {
			  return new something(http, ENDORSEMENT_BASE_PATH);
		  },
		  deps: [Http]
	  }*/
  ]
})
export class EndorsementApiModule { }
