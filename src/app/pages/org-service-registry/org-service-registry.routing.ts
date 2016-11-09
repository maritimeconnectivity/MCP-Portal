import { Routes, RouterModule }  from '@angular/router';

import { OrgServiceRegistryComponent } from './org-service-registry.component';
import {SpecificationsComponent} from "./specifications/specifications.component";
import {DesignsComponent} from "./designs/designs.component";
import {InstancesComponent} from "./instances/instances.component";
import {SrHowToComponent} from "./sr-how-to/sr-how-to.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: OrgServiceRegistryComponent,
    children: [
	    { path: 'howto', component: SrHowToComponent },
	    { path: 'specifications', component: SpecificationsComponent },
      { path: 'designs', component: DesignsComponent },
      { path: 'instances', component: InstancesComponent }

    ]
  }
];

export const routing = RouterModule.forChild(routes);
