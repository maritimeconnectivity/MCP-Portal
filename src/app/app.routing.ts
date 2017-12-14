import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {Four04Component} from "./four04/four04.component";
import {ApplyOrgComponent} from "./apply-org/apply-org.component";
import {BugReportComponent} from "./bug-report/bug-report.component";
import {AboutComponent} from "./about/about.component";

export const routes: Routes = [
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'apply', component: ApplyOrgComponent },
	{ path: 'report', component: BugReportComponent },
	{ path: 'about', component: AboutComponent },
  { path: '**', component: Four04Component }
  //{ path: '**', pathMatch:'full', redirectTo: '/404' }
  //{ path: '**', component: Pages } // TODO: add 404 component
];

export const routing = RouterModule.forRoot(routes, { useHash: true });
