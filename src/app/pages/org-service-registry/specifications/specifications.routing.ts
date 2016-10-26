import { Routes, RouterModule }  from '@angular/router';
import {SpecificationsComponent} from "./specifications.component";
import {SpecificationListComponent} from "./components/specification-list/specification-list.component";
import {SpecificationDetailsComponent} from "./components/specification-details/specification-details.component";
import {SpecificationNewComponent} from "./components/specification-new/specification-new.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'specifications',
    component: SpecificationsComponent,
    data:{breadcrumb: 'Specifications'},
    children: [
      {
        path: '',
        component: SpecificationListComponent
      },
      {
        path: 'register',
        component: SpecificationNewComponent,
        data:{breadcrumb: 'Register'}
      },
      {
        path: ':id',
        component: SpecificationDetailsComponent,
        data:{breadcrumb: 'Details'}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
