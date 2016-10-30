import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { OrganizationsComponent } from './organizations.component';
import { routing }       from './organizations.routing';
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    OrganizationsComponent
  ]
})
export default class OrganizationsModule {}
