import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './designs.routing';
import {NgaModule} from "../../../theme/nga.module";
import {DesignsComponent} from "./designs.component";
import {DesignListComponent} from "./components/design-list/design-list.component";
import {DesignDetailsComponent} from "./components/design-details/design-details.component";
import {SharedModule} from "../../shared/shared.module";


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
    DesignDetailsComponent
  ]
})
export default class DesignsModule {
}
