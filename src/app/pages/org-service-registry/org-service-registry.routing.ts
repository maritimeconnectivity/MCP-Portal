import { Routes, RouterModule }  from '@angular/router';

import { OrgServiceRegistryComponent } from './org-service-registry.component';
import { OrgSpecificationsComponent } from './components/org-specifications/org-specifications.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrgServiceRegistryComponent,
    children: [
      { path: 'org-specifications', component: OrgSpecificationsComponent }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
