import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './vessels.routing';
import { VesselsComponent } from "./vessels.component";
import { VesselListComponent } from "./components/vessel-list/vessel-list.component";
import { VesselDetailsComponent } from "./components/vessel-details/vessel-details.component";
import { NgaModule } from "../../../theme/nga.module";
import { SharedModule } from "../../shared/shared.module";
import { VesselNewComponent } from "./components/vessel-new/vessel-new.component";
import { VesselUpdateComponent } from "./components/vessel-update/vessel-update.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    VesselsComponent,
    VesselDetailsComponent,
    VesselListComponent,
	  VesselNewComponent,
	  VesselUpdateComponent
  ]
})
export default class VesselsModule {
}
