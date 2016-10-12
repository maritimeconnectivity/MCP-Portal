import { Routes, RouterModule }  from '@angular/router';

import { OrgIdentityRegistryComponent } from './org-identity-registry.component';
import { OrgDevicesComponent } from './components/org-devices/org-devices.component';
import {OrgServicesComponent} from "./components/org-services/org-services.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrgIdentityRegistryComponent,
    children: [
      { path: 'devices', component: OrgDevicesComponent },
      { path: 'services', component: OrgServicesComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
