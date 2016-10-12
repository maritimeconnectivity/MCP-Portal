import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';
import {AuthGuard} from "../authentication/services/auth-guard.service";
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'pages',
    component: Pages,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'my-organization', pathMatch: 'full' },
      { path: 'my-organization', loadChildren: () => System.import('./my-organization/my-organization.module') },
      { path: 'ir', loadChildren: () => System.import('./org-identity-registry/org-identity-registry.module.ts') },
      { path: 'sr', loadChildren: () => System.import('./org-service-registry/org-service-registry.module.ts') }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
