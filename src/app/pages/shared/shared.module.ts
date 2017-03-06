import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import {DesignsTableComponent} from "./components/designs-table/designs-table.component";
import {SpecificationsTableComponent} from "./components/specifications-table/specifications-table.component";
import {NgaModule} from "../../theme/nga.module";
import {InstancesTableComponent} from "./components/instances-table/instances-table.component";
import {SrViewModelService} from "../org-service-registry/shared/services/sr-view-model.service";
import {CertificatesTableComponent} from "./components/certificates-table/certificates-table.component";
import {CertificateHelperService} from "./services/certificate-helper.service";
import {OrganizationDetailsTableComponent} from "./components/organizaton-details-table/organization-details-table.component";
import {OrganizationViewModelService} from "./services/organization-view-model.service";
import {CertificateIssueNewComponent} from "./components/certificate-issue-new/certificate-issue-new.component";
import {ServiceDetailsViewComponent} from "./components/service-details-view/service-details-view.component";
import {CertificateRevokeComponent} from "./components/certificate-revoke/certificate-revoke.component";
import {ServiceRegistrySearchComponent} from "./components/service-registry-search/service-registry-search.component";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  imports: [
    CommonModule,
    NgaModule,
	  ReactiveFormsModule
  ],
  declarations: [
    DesignsTableComponent,
    InstancesTableComponent,
    SpecificationsTableComponent,
    CertificatesTableComponent,
    OrganizationDetailsTableComponent,
    CertificateIssueNewComponent,
	  CertificateRevokeComponent,
	  ServiceDetailsViewComponent,
	  ServiceRegistrySearchComponent
  ],
  exports: [
    OrganizationDetailsTableComponent,
    DesignsTableComponent,
    InstancesTableComponent,
    SpecificationsTableComponent,
    CertificatesTableComponent,
    CertificateIssueNewComponent,
	  CertificateRevokeComponent,
	  ServiceDetailsViewComponent,
	  ServiceRegistrySearchComponent
  ],
  providers: [
    SrViewModelService,
    CertificateHelperService,
    OrganizationViewModelService
  ]
})
export class SharedModule {
}
