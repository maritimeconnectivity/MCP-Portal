import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';
import {AuthGuard} from "../authentication/services/auth-guard.service";
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'pages',
    component: Pages,
    canActivate: [AuthGuard],
    data:{breadcrumb: 'Home'},
    children: [
      { path: '', redirectTo: 'my-organization', pathMatch: 'full' },
      { path: 'my-organization', loadChildren: () => System.import('./organizations/components/my-organization/my-organization.module')},
      { path: 'organizations', loadChildren: () => System.import('./organizations/organizations.module.ts')},
      { path: 'ir', loadChildren: () => System.import('./org-identity-registry/org-identity-registry.module.ts')},
	    { path: 'sr', loadChildren: () => System.import('./org-service-registry/org-service-registry.module.ts') },
	    { path: 'administration', loadChildren: () => System.import('./administration/administration.module.ts') }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
