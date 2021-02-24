import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './designs.routing';
import { NgaModule } from "../../../theme/nga.module";
import { DesignsComponent } from "./designs.component";
import { DesignListComponent } from "./components/design-list/design-list.component";
import { DesignDetailsComponent } from "./components/design-details/design-details.component";
import { SharedModule } from "../../shared/shared.module";
import { DesignNewComponent } from "./components/design-new/design-new.component";
import { DesignUpdateComponent } from "./components/design-update/design-update.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    DesignsComponent,
    DesignListComponent,
    DesignDetailsComponent,
    DesignNewComponent,
	  DesignUpdateComponent
  ]
})
export default class DesignsModule {
}
