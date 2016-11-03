import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './pages.routing';
import { NgaModule } from '../theme/nga.module';

import { Pages } from './pages.component';
import {ServiceRegistryModule} from "../backend-api/service-registry/service-registry.module";
import {OrganizationsService} from "../backend-api/identity-registry/services/organizations.service";
import {SpecificationsService} from "../backend-api/service-registry/services/specifications.service";
import {DesignsService} from "../backend-api/service-registry/services/designs.service";
import {InstancesService} from "../backend-api/service-registry/services/instances.service";
import {IdServicesService} from "../backend-api/identity-registry/services/id-services.service";
import {CertificatesService} from "../backend-api/identity-registry/services/certificates.service";
import {DevicesService} from "../backend-api/identity-registry/services/devices.service";
import {UsersService} from "../backend-api/identity-registry/services/users.service";
import {VesselsService} from "../backend-api/identity-registry/services/vessels.service";

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    ServiceRegistryModule,
    routing
  ],
  declarations: [Pages],
  providers: [
    OrganizationsService,
    IdServicesService,
    SpecificationsService,
    DesignsService,
    InstancesService,
    CertificatesService,
    DevicesService,
    UsersService,
    VesselsService
  ]
})
export class PagesModule {
}
