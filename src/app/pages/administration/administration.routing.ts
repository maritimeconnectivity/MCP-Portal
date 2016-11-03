import { Routes, RouterModule }  from '@angular/router';

import { AdministrationComponent } from './administration.component';
import {ApproveOrganizationComponent} from "./approve-organizations/approve-organization.component";
import {SiteAdminAuthGuard} from "../../authentication/services/site-admin-guard.service";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: AdministrationComponent,
	  canActivate: [SiteAdminAuthGuard],
    children: [
	    { path: 'approve', component: ApproveOrganizationComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
