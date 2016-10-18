import { Routes, RouterModule }  from '@angular/router';

import { OrgServiceRegistryComponent } from './org-service-registry.component';
import { SpecificationDetailsComponent } from './specifications/components/specification-details/specification-details.component';
import {SpecificationListComponent} from "./specifications/components/specification-list/specification-list.component";
import {SpecificationsComponent} from "./specifications/specifications.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrgServiceRegistryComponent,
    children: [
      { path: 'specifications', component: SpecificationsComponent }/*,
      { path: 'designs', component: DesignsComponent },
      { path: 'instances', component: InstancesComponent },*/

    ]
  }
];

export const routing = RouterModule.forChild(routes);
