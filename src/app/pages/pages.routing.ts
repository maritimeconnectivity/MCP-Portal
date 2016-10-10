import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'my-organization', pathMatch: 'full' },
      { path: 'my-organization', loadChildren: () => System.import('./my-organization/my-organization.module') },
      { path: 'org-identity-registry', loadChildren: () => System.import('./org-identity-registry/org-identity-registry.module.ts') },
      { path: 'org-service-registry', loadChildren: () => System.import('./org-service-registry/org-service-registry.module.ts') }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
