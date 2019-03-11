import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../../shared/navigation-helper.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import { AgentsService } from '../../../../../backend-api/identity-registry/services/agents.service';
import { Agent } from '../../../../../backend-api/identity-registry/autogen/model/agent';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import {
    McFormControlModel,
    McFormControlModelSelect,
    McFormControlType,
    SelectModel
} from '../../../../../theme/components/mcForm/mcFormControlModel';
import { SelectValidator } from '../../../../../theme/validators';

@Component({
    selector: 'agent-update',
    encapsulation: ViewEncapsulation.None,
    template: require('./agent-update.html'),
    styles: []
})
export class AgentUpdateComponent implements OnInit, OnDestroy {

    private agentOrg: Organization;
    public agentOrgName: string;
    private allOrgs: Array<Organization>;

    private organization: Organization;
    private agent: Agent;
    public isLoading: boolean;
    public isUpdating: boolean;
    public showModal: boolean = false;
    public modalDescription: string;
    public updateTitle: string = 'Update agent';
    public updateForm: FormGroup;
    public formControlModels: Array<McFormControlModel>;

    constructor(private changeDetector: ChangeDetectorRef, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private agentsService: AgentsService, private orgService: OrganizationsService) {
    }

    public ngOnInit() {
        this.isLoading = true;
        this.isUpdating = false;
        this.loadMyOrganization();
    }

    public ngOnDestroy() {
        this.changeDetector.detach();
    }

    public cancel() {
        this.navigationService.navigateToAgent(this.agent.id);
    }

    public cancelModal() {
        this.showModal = false;
    }

    public update() {
        this.modalDescription = 'Are you sure you want to update this agent?';
        this.showModal = true;
    }

    public updateForSure() {
        this.isUpdating = true;
        this.updateAgent();
    }

    private updateAgent() {
        this.agentsService.updateAgent(this.agent.id, this.agent).subscribe(agent => {
            this.navigationService.navigateToAgent(agent.id);
        }, err => {
            this.isUpdating = false;
            this.notifications.generateNotification('Error', 'Error when trying to update agent', MCNotificationType.Error, err);
        });
    }

    private loadMyOrganization() {
        this.orgService.getMyOrganization().subscribe(organization => {
            this.organization = organization;
            this.loadAgent();
        }, err => {
            this.isLoading = false;
            this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
        });
    }

    private loadAllOrgs() {
        this.orgService.getAllOrganizations().subscribe(orgs => {
            this.allOrgs = orgs;
            this.generateForm();
            this.isLoading = false;
            this.changeDetector.detectChanges();
        }, err => {
            this.isLoading = false;
            this.notifications.generateNotification('Error', 'Error when trying to get all organizations', MCNotificationType.Error, err);
        });
    }

    private loadAgent() {
        let agentId = this.activatedRoute.snapshot.params['id'];
        this.agentsService.getAgent(agentId).subscribe(agent => {
            this.agent = agent;
            this.orgService.getOrganizationById(agent.idActingOrganization).subscribe(org => {
                this.agentOrg = org;
                this.agentOrgName = org.name;
                this.loadAllOrgs();
            }, err => {
                this.isLoading = false;
                this.notifications.generateNotification('Error', 'Error when trying to get agent organization', MCNotificationType.Error, err);
            });
        },
        err => {
            this.isLoading = false;
            this.notifications.generateNotification('Error', 'Error when trying to get agent', MCNotificationType.Error, err);
        });
    }

    private generateForm() {
        this.updateForm = this.formBuilder.group({});
        this.formControlModels = [];

        let selectValues = this.selectValues();
        let formControlModel: McFormControlModelSelect = {selectValues: selectValues, formGroup: this.updateForm, elementId: 'agentOrgs', controlType: McFormControlType.Select, labelName: 'Agent Organization', validator: SelectValidator.validate, showCheckmark: true};
        let formControl = new FormControl(this.selectedValue(selectValues), formControlModel.validator);
        formControl.valueChanges.subscribe(param => {
            if (param && this.agentOrg != param) {
                this.agentOrg = param;
                this.generateForm();
            }
        });
        this.updateForm.addControl(formControlModel.elementId, formControl);
        this.formControlModels.push(formControlModel);
        this.changeDetector.detectChanges();
    }

    private selectValues(): Array<SelectModel> {
        let selectValues: Array<SelectModel> = [];
        selectValues.push({value: undefined, label: 'Choose Organization...', isSelected: this.agentOrg == null});

        this.allOrgs.forEach(org => {
            let isSelected = org.name === this.agentOrg.name;
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