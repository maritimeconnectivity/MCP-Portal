import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {Four04Component} from "./four04/four04.component";

export const routes: Routes = [
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: '**', component: Four04Component }
  //{ path: '**', pathMatch:'full', redirectTo: '/404' }
  //{ path: '**', component: Pages } // TODO: add 404 component
];

export const routing = RouterModule.forRoot(routes, { useHash: true });
