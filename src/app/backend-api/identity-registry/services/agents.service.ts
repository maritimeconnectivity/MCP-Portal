import { Injectable } from '@angular/core';
import { AgentControllerService } from '../autogen/api/agentController.service';

@Injectable
export class AgentsService {
    constructor(agentsApi: AgentControllerService) {}
}