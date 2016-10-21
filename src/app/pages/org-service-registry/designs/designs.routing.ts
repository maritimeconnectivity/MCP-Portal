import { Routes, RouterModule }  from '@angular/router';
import {DesignsComponent} from "./designs.component";
import {DesignListComponent} from "./components/design-list/design-list.component";
import {DesignDetailsComponent} from "./components/design-details/design-details.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'designs',
    component: DesignsComponent,
    data:{breadcrumb: 'Designs'},
    children: [
      {
        path: '',
        component: DesignListComponent
      },
      {
        path: ':id',
        component: DesignDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
