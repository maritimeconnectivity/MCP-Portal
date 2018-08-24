import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Organization } from '../../../../../backend-api/identity-registry/autogen/model/Organization';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavigationHelperService } from '../../../../../shared/navigation-helper.service';
import {
    MCNotificationsService,
    MCNotificationType
} from '../../../../../shared/mc-notifications.service';
import { OrganizationsService } from '../../../../../backend-api/identity-registry/services/organizations.service';
import { RolesService } from '../../../../../backend-api/identity-registry/services/roles.service';
import {
    McFormControlModel,
    McFormControlModelSelect,
    McFormControlType,
    SelectModel
} from '../../../../../theme/components/mcForm/mcFormControlModel';
import { SelectValidator } from '../../../../../theme/validators';
import { Role } from '../../../../../backend-api/identity-registry/autogen/model/Role';
import { RoleViewModel } from '../../view-models/RoleViewModel';
import RoleNameEnum = Role.RoleNameEnum;

@Component({
    selector: 'role-new',
    encapsulation: ViewEncapsulation.None,
    template: require('./role-new.html'),
    styles: []
})
export class RoleNewComponent implements OnInit {
    private roleName: RoleNameEnum = null;

    public organization: Organization;
    public isLoading = true;
    public isRegistering = false;
    public registerTitle = "Register Role";
    public registerForm: FormGroup;
    public formControlModels: Array<McFormControlModel>;

    constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private orgService: OrganizationsService, private rolesService: RolesService){
    }

    ngOnInit() {
        this.isRegistering = false;
        this.isLoading = true;
        this.loadMyOrganization();
    }

    public cancel() {
        this.navigationService.cancelCreateRole();
    }

    public register() {
        this.isRegistering = true;
        let role: Role = {
            permission: this.registerForm.value.permission,
            roleName: this.registerForm.value.role
        };
        this.createRole(role);
    }

    private createRole(role: Role) {
        this.rolesService.createRole(this.organization.mrn, role).subscribe(role => {
           this.navigationService.navigateToRole(role.id);
           this.isRegistering = false;
        },
            err => {
                this.isRegistering = false;
                this.notifications.generateNotification('Error', 'Error when trying to create role', MCNotificationType.Error, err);
            });
    }

    private loadMyOrganization() {
        this.orgService.getMyOrganization().subscribe(
            organization => {
                this.organization = organization;
                this.generateForm();
                this.isLoading = false;
            },
            err => {
                this.isLoading = false;
                this.notifications.generateNotification('Error', 'Error when trying to get organization', MCNotificationType.Error, err);
            }
        )
    }

    private generateForm() {
        this.registerForm = this.formBuilder.group({});
        this.formControlModels = [];

        let formControlModel: McFormControlModel = {formGroup: this.registerForm, elementId: 'permission', controlType: McFormControlType.Text, labelName: 'Permission Name', placeholder: 'Enter Permission name', validator: Validators.required};
        let formControl = new FormControl('', formControlModel.validator);
        this.registerForm.addControl(formControlModel.elementId, formControl);
        this.formControlModels.push(formControlModel);

        let selectValues = this.selectValues();
        let formControlModelSelect: McFormControlModelSelect = {selectValues: selectValues, formGroup: this.registerForm, elementId: 'role', controlType: McFormControlType.Select, labelName: 'Role Name', placeholder: '', validator: SelectValidator.validate, showCheckmark: true};
        formControl = new FormControl(this.selectedValue(selectValues), formControlModelSelect.validator);
        formControl.valueChanges.subscribe(param => {
           if (param && this.roleName != param) {
               this.roleName = param;
               this.generateForm();
           }
        });
        this.registerForm.addControl(formControlModelSelect.elementId, formControl);
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