import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Role } from '../../../../../backend-api/identity-registry/autogen/model/Role';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    McFormControlModel,
    McFormControlModelSelect,
    McFormControlType,
    SelectModel
} from '../../../../../theme/components/mcForm/mcFormControlModel';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../../shared/navigation-helper.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';
import { RolesService } from '../../../../../backend-api/identity-registry/services/roles.service';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import { RoleViewModel } from '../../view-models/RoleViewModel';
import { SelectValidator } from '../../../../../theme/validators';
import RoleNameEnum = Role.RoleNameEnum;

@Component({
    selector: 'role-update',
    encapsulation: ViewEncapsulation.None,
    template: require('./role-update.html'),
    styles: []
})
export class RoleUpdateComponent implements OnInit {
    private organization: Organization;
    private roleName: RoleNameEnum;

    public role: Role;
    public showModal: boolean = false;
    public modalDescription: string;
    public isLoading = true;
    public isUpdating = false;
    public updateTitle: string = 'Update role';
    public updateForm: FormGroup;
    public formControlModels: Array<McFormControlModel>;

    constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private rolesService: RolesService, private orgService: OrganizationsService) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.isUpdating = false;
        this.loadMyOrganization();
    }

    public cancel() {
        this.navigationService.navigateToRole(this.role.id);
    }

    public update() {
        this.showModal = true;
    }

    public updateForSure() {
        this.isUpdating = true;
        this.role.roleName = this.updateForm.value.role;
        this.updateRole();
    }

    private updateRole() {
        this.rolesService.updateRole(this.organization.mrn, this.role.id, this.role).subscribe(() => {
            this.navigationService.navigateToRole(this.role.id);
        }, err => {
           this.isUpdating = false;
           this.notifications.generateNotification('Error', 'Error when trying to update role', MCNotificationType.Error, err);
        });
    }

    private loadMyOrganization() {
        this.orgService.getMyOrganization().subscribe(organization => {
            this.organization = organization;
            this.loadRole();
        }, err => {
            this.isLoading = false;
            this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
        });
    }

    private loadRole() {
        let roleId = this.activatedRoute.snapshot.params['id'];
        this.rolesService.getRole(this.organization.mrn, roleId).subscribe(role => {
            this.role = role;
            this.roleName = role.roleName;
            this.generateForm();
            this.isLoading = false;
        }, err => {
            this.isLoading = false;
            this.notifications.generateNotification('Error', 'Error when trying to get role', MCNotificationType.Error, err);
        });
    }

    private generateForm() {
        this.updateForm = this.formBuilder.group({});
        this.formControlModels = [];

        let formControlModel: McFormControlModel = {
            formGroup: this.updateForm,
            elementId: 'permission',
            controlType: McFormControlType.Text,
            labelName: 'Permission',
            placeholder: '',
            isDisabled: true
        };
        let formControl = new FormControl(this.role.permission, formControlModel.validator);
        this.updateForm.addControl(formControlModel.elementId, formControl);
        this.formControlModels.push(formControlModel);

        // TODO something is wrong here
        let selectValues = this.selectValues();
        let formControlModelSelect: McFormControlModelSelect = {selectValues: selectValues, formGroup: this.updateForm, elementId: 'role', controlType: McFormControlType.Select, labelName: 'Role Name', validator: SelectValidator.validate, showCheckmark: true};
        formControl = new FormControl(this.selectedValue(selectValues), formControlModelSelect.validator);
        formControl.valueChanges.subscribe(param => {
            if (param && this.roleName != param) {
                this.roleName = param;
            }
        });
        this.updateForm.addControl(formControlModelSelect.elementId, formControl);
        this.formControlModels.push(formControlModelSelect);
    }

    private selectValues(): Array<SelectModel> {
        let selectValues: Array<SelectModel> = [];
        selectValues.push({value: undefined, label: 'Choose Role...', isSelected: this.roleName == null});
        let allRoleNames = RoleViewModel.getAllRoleNames();
        allRoleNames.forEach(roleName => {
            let isSelected = RoleNameEnum[roleName.value] === RoleNameEnum[this.roleName];
            selectValues.push({value: roleName.value, label: roleName.label, isSelected: isSelected});
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