import { Injectable } from '@angular/core';
import { AuthService } from '../authentication/services/auth.service';
import { GlobalState } from '../global.state';

@Injectable()
export class ActingService {
    private readonly originalOrg: string;

    constructor(private authService: AuthService, private globalState: GlobalState) {
        this.originalOrg = this.authService.authState.orgMrn;
    }

    public actOnBehalfOf(orgMrn: string) {
        this.authService.authState.orgMrn = orgMrn;
        this.authService.authState.acting = true;
        this.globalState.notifyDataChanged('org_name_changed', orgMrn);
    }

    public stopActing() {
        this.authService.authState.orgMrn = this.originalOrg;
        this.authService.authState.acting = false;
        this.globalState.notifyDataChanged('org_name_changed', this.originalOrg);
    }
}