import { NgModule }      from '@angular/core';
import {CommonModule, DatePipe}  from '@angular/common';

import { routing }       from './pages.routing';
import { NgaModule } from '../theme/nga.module';

import { Pages } from './pages.component';
import {ServiceRegistryApiModule} from "../backend-api/service-registry/service-registry-api.module";
import {OrganizationsService} from "../backend-api/identity-registry/services/organizations.service";
import {SpecificationsService} from "../backend-api/service-registry/services/specifications.service";
import {DesignsService} from "../backend-api/service-registry/services/designs.service";
import {InstancesService} from "../backend-api/service-registry/services/instances.service";
import {IdServicesService} from "../backend-api/identity-registry/services/id-services.service";
import {CertificatesService} from "../backend-api/identity-registry/services/certificates.service";
import {DevicesService} from "../backend-api/identity-registry/services/devices.service";
import {UsersService} from "../backend-api/identity-registry/services/users.service";
import {VesselsService} from "../backend-api/identity-registry/services/vessels.service";
import {LogoService} from "../backend-api/identity-registry/services/logo.service";
import {DocsService} from "../backend-api/service-registry/services/docs.service";
import {XsdsService} from "../backend-api/service-registry/services/xsds.service";
import {XmlsService} from "../backend-api/service-registry/services/xmls.service";
import {EndorsementApiModule} from "../backend-api/endorsements/endorsement-api.module";
import {EndorsementsService} from "../backend-api/endorsements/services/endorsements.service";
import {VesselImageService} from "../backend-api/identity-registry/services/vessel-image.service";

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    ServiceRegistryApiModule,
	  EndorsementApiModule,
    routing
  ],
  declarations: [Pages],
  providers: [
    OrganizationsService,
    IdServicesService,
    SpecificationsService,
    DesignsService,
    InstancesService,
	  DocsService,
	  XmlsService,
	  XsdsService,
	  EndorsementsService,
    CertificatesService,
    DevicesService,
    UsersService,
    VesselsService,
	  VesselImageService,
	  LogoService,
	  DatePipe
  ]
})
export class PagesModule {
}
