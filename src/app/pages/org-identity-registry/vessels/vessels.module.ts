import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './vessels.routing';
import {VesselsComponent} from "./vessels.component";
import {VesselListComponent} from "./components/vessel-list/vessel-list.component";
import {VesselDetailsComponent} from "./components/vessel-details/vessel-details.component";
import {NgaModule} from "../../../theme/nga.module";
import {SharedModule} from "../../shared/shared.module";
import {VesselNewComponent} from "./components/vessel-new/vessel-new.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
	  FormsModule,
	  ReactiveFormsModule,
    SharedModule,
    routing
  ],
  declarations: [
    VesselsComponent,
    VesselDetailsComponent,
    VesselListComponent,
	  VesselNewComponent
  ]
})
export default class VesselsModule {
}
