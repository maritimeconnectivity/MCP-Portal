import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    McFormControlModel, McFormControlModelSelect,
    McFormControlType,
    SelectModel
} from '../../../../../theme/components/mcForm/mcFormControlModel';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../../shared/navigation-helper.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import { AgentsService } from '../../../../../backend-api/identity-registry/services/agents.service';
import { SelectValidator } from '../../../../../theme/validators';
import { Agent } from '../../../../../backend-api/identity-registry/autogen/model/agent';

@Component({
    selector: 'agent-new',
    encapsulation: ViewEncapsulation.None,
    template: require('./agent-new.html'),
    styles: []
})
export class AgentNewComponent implements OnInit, OnDestroy {
    private agentOrg: Organization;
    private allOrgs: Array<Organization>;

    public organization: Organization;
    public isLoading: boolean;
    public isRegistering: boolean = false;
    public registerTitle: string = "Register Agent";
    public registerForm: FormGroup;
    public formControlModels: Array<McFormControlModel>;

    constructor(private changeDetector: ChangeDetectorRef, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private agentsService: AgentsService) {
    }

    ngOnInit() {
        this.isRegistering = false;
        this.isLoading = true;
        this.loadMyOrganization();
    }

    ngOnDestroy() {
        this.changeDetector.detach();
    }

    public register() {
        this.isRegistering = true;
        let agent: Agent = {
            idActingOrganization: this.agentOrg.id,
            idOnBehalfOfOrganization: this.organization.id
        };
        this.createAgent(agent);
    }

    private createAgent(agent: Agent) {
        this.agentsService.createAgent(agent).subscribe(agent => {
           this.navigationService
        });
    }

    private loadMyOrganization() {
        this.orgService.getMyOrganization().subscribe(org => {
            this.organization = org;
            this.loadAllOrgs();
        },
            err => {
                this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
            });
    }

    private loadAllOrgs() {
        this.orgService.getAllOrganizations().subscribe(orgs => {
            this.allOrgs = orgs;
            this.generateForm();
            this.isLoading = false;
            this.changeDetector.detectChanges();
        });
    }

    private generateForm() {
        this.registerForm = this.formBuilder.group({});
        this.formControlModels = [];

        let selectValues = this.selectValues();
        let formControlModel: McFormControlModelSelect = {selectValues: selectValues, formGroup: this.registerForm, elementId: 'agentOrg', controlType: McFormControlType.Select, labelName: 'Agent Organization', placeholder: '', validator: SelectValidator.validate, showCheckmark: true};
        let formControl = new FormControl(this.selectedValue(selectValues), formControlModel.validator);
        formControl.valueChanges.subscribe(param => {
            if (param && this.agentOrg != param) {
                this.agentOrg = param;
                this.generateForm();
            }
        });
        this.registerForm.addControl(formControlModel.elementId, formControl);
        this.formControlModels.push(formControlModel);
        this.changeDetector.detectChanges();
    }

    private selectValues(): Array<SelectModel> {
        let selectValues: Array<SelectModel> = [];
        selectValues.push({value: undefined, label: 'Choose Organization...', isSelected: this.agentOrg === null});

        this.allOrgs.forEach(org => {
           let isSelected = org === this.agentOrg;
           selectValues.push({value: org, label: org.name, isSelected: isSelected});
        });
        return selectValues;
    }

    private selectedValue(selectValues: Array<SelectModel>): any {
        selectValues.forEach(selectModel => {
          if (selectModel.isSelected) {
              return selectModel.value;
          }
        });
        return '';
    }
}