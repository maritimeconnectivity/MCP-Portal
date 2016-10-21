import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './pages.routing';
import { NgaModule } from '../theme/nga.module';

import { Pages } from './pages.component';
import {ServiceRegistryModule} from "../backend-api/service-registry/service-registry.module";
import {OrganizationsService} from "../backend-api/identity-registry/services/organizations.service";
import {SpecificationsService} from "../backend-api/service-registry/services/specifications.service";
import {DesignsService} from "../backend-api/service-registry/services/designs.service";

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    ServiceRegistryModule, // Importing this in the pages module, because Service Registry should ONLY be used when logged in, and when we are logged in, we are in the pages module
    routing
  ],
  declarations: [Pages],
  providers: [
    OrganizationsService,
    SpecificationsService,
    DesignsService
  ]
})
export class PagesModule {
}
