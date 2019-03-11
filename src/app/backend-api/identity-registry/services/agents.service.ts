import { Injectable, OnInit } from '@angular/core';
import { AgentControllerService } from '../autogen/api/agentController.service';
import { Agent } from '../autogen/model/agent';
import { Observable } from 'rxjs';
import { AuthService } from '../../../authentication/services/auth.service';
import { ResponseEntity } from '../autogen/model/responseEntity';
import { PageOfAgent } from '../autogen/model/pageOfAgent';
import { SortingHelper } from '../../shared/SortingHelper';
import { PAGE_SIZE_DEFAULT } from '../../../shared/app.constants';

@Injectable()
export class AgentsService implements OnInit {
    constructor(private agentsApi: AgentControllerService, private authService: AuthService) {}

    ngOnInit() {
    }

    public createAgent(input: Agent) : Observable<Agent> {
        let orgMrn = this.authService.authState.orgMrn;
        return this.agentsApi.createAgentUsingPOST(input, orgMrn);
    }

    public getAgent(agentId: number) : Observable<Agent> {
        let orgMrn = this.authService.authState.orgMrn;
        return this.agentsApi.getAgentUsingGET(agentId, orgMrn);
    }

    public deleteAgent(agentId: number) : Observable<ResponseEntity> {
        let orgMrn = this.authService.authState.orgMrn;
        return this.agentsApi.deleteAgentUsingDELETE(agentId, orgMrn);
    }

    public getActingOnBehalfOf() : Observable<PageOfAgent> {
        let orgMrn = this.authService.authState.orgMrn;
        let sort = SortingHelper.sortingForAgents();
        // TODO: do paging properly
        return this.agentsApi.getActingOnBehalfOfUsingGET(orgMrn, 0, 0, 0, PAGE_SIZE_DEFAULT, true, PAGE_SIZE_DEFAULT, sort);
    }

    public getAgents() : Observable<PageOfAgent> {
        let orgMrn = this.authService.authState.orgMrn;
        let sort = SortingHelper.sortingForAgents();
        return this.agentsApi.getAgentsUsingGET(orgMrn, 0, 0, 0, PAGE_SIZE_DEFAULT, true, PAGE_SIZE_DEFAULT, sort);
    }

    public updateAgent(agentId: number, input: Agent) : Observable<Agent> {
        let orgMrn = this.authService.authState.orgMrn;
        return this.agentsApi.updateAgentUsingPUT(agentId, input, orgMrn);
    }
}