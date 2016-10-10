import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { MyOrganization } from './my-organization.component';
import { routing }       from './my-organization.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing
  ],
  declarations: [
    MyOrganization
  ],
  providers: [
  ]
})
export default class MyOrganizationModule {}
