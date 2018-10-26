import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'agents',
        data: {breadcrumb: 'Agents'},
        children: []
    }
];

export const routing = RouterModule.forChild(routes);