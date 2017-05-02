import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './specifications.routing';
import {SpecificationsComponent} from "./specifications.component";
import {SpecificationListComponent} from "./components/specification-list/specification-list.component";
import {SpecificationDetailsComponent} from "./components/specification-details/specification-details.component";
import {NgaModule} from "../../../theme/nga.module";
import {SharedModule} from "../../shared/shared.module";
import {SpecificationNewComponent} from "./components/specification-new/specification-new.component";
import {SpecificationUpdateComponent} from "./components/specification-update/specification-update.component";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    SharedModule,
    routing
  ],
  declarations: [
    SpecificationsComponent,
    SpecificationDetailsComponent,
    SpecificationListComponent,
    SpecificationNewComponent,
	  SpecificationUpdateComponent
  ]
})
export default class SpecificationsModule {
}
