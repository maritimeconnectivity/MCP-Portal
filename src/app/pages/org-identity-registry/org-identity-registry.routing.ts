import { Routes, RouterModule }  from '@angular/router';

import { OrgIdentityRegistryComponent } from './org-identity-registry.component';
import {VesselsComponent} from "./vessels/vessels.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrgIdentityRegistryComponent,
    children: [
      { path: 'vessels', component: VesselsComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
