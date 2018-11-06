import { RouterModule, Routes } from '@angular/router';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { AgentDetailsComponent } from './components/agent-details/agent-details.component';
import { AgentNewComponent } from './components/agent-new/agent-new.component';

const routes: Routes = [
    {
        path: 'agents',
        data: {breadcrumb: 'Agents'},
        children: [
            {
                path: '',
                component: AgentListComponent
            },
            {
                path: ':id',
                component: AgentDetailsComponent,
                data: {breadcrumb: 'Details'}
            },
            {
                path: 'register',
                component: AgentNewComponent,
                data: {breadcrumb: 'Register'}
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);