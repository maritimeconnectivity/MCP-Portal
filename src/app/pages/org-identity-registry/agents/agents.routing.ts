import { RouterModule, Routes } from '@angular/router';
import { AgentListComponent } from './components/agent-list/agent-list.component';

const routes: Routes = [
    {
        path: 'agents',
        data: {breadcrumb: 'Agents'},
        children: [
            {
                path: '',
                component: AgentListComponent
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);