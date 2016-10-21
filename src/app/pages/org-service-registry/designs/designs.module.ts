import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './designs.routing';
import {NgaModule} from "../../../theme/nga.module";
import {DesignsComponent} from "./designs.component";
import {DesignListComponent} from "./components/design-list/design-list.component";
import {DesignsTableComponent} from "./components/designs-table/designs-table.component";
import {DesignDetailsComponent} from "./components/design-details/design-details.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    routing
  ],
  declarations: [
    DesignsComponent,
    DesignListComponent,
    DesignsTableComponent,
    DesignDetailsComponent
  ],
  exports: [
    DesignsTableComponent
  ]
})
export default class DesignsModule {
}
