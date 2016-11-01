import { Routes, RouterModule }  from '@angular/router';

import { OrgIdentityRegistryComponent } from './org-identity-registry.component';
import {VesselsComponent} from "./vessels/vessels.component";
import {DevicesComponent} from "./devices/devices.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrgIdentityRegistryComponent,
    children: [
	    { path: 'devices', component: DevicesComponent },
	    { path: 'vessels', component: VesselsComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
