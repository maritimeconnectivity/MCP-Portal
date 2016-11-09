import { Routes, RouterModule }  from '@angular/router';
import {SrHowToComponent} from "./sr-how-to.component";

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'howto',
    component: SrHowToComponent,
    data:{breadcrumb: 'How To?'},
    children: [
    ]
  }
];

export const routing = RouterModule.forChild(routes);
