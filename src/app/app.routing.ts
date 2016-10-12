import { Routes, RouterModule } from '@angular/router';
import {Pages} from "./pages/pages.component";
import {LoginComponent} from "./login/login.component";

export const routes: Routes = [
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: '**', pathMatch:'full', redirectTo: '/randompath' }
  //{ path: '**', component: Pages } // TODO: add 404 component
];

export const routing = RouterModule.forRoot(routes, { useHash: true });
