import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavigationHelperService} from "../../../../../shared/navigation-helper.service";
import {MCNotificationsService, MCNotificationType} from "../../../../../shared/mc-notifications.service";
import {FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import {
	McFormControlModel, McFormControlType
} from "../../../../../theme/components/mcForm/mcFormControlModel";
import {User} from "../../../../../backend-api/identity-registry/autogen/model/User";
import {UsersService} from "../../../../../backend-api/identity-registry/services/users.service";
import {McUtils} from "../../../../../shared/mc-utils";


@Component({
  selector: 'user-update',
  encapsulation: ViewEncapsulation.None,
  template: require('./user-update.html'),
  styles: []
})
export class UserUpdateComponent implements OnInit {
	public user: User;
	// McForm params
	public isLoading = true;
	public isUpdating = false;
	public updateTitle = "Update user";
	public updateForm: FormGroup;
	public formControlModels: Array<McFormControlModel>;

	constructor(private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private navigationService: NavigationHelperService, private notifications: MCNotificationsService, private usersService: UsersService) {
	}

	ngOnInit() {
		this.isUpdating = false;
		this.isLoading = true;
		this.loadUser();
	}

	public cancel() {
		let userMrn = (this.user ? this.user.mrn : '');
		this.navigationService.navigateToUser(userMrn);
	}

	public update() {
		this.isUpdating = true;
		this.user.firstName = this.updateForm.value.firstName;
		this.user.lastName = this.updateForm.value.lastName;
		this.user.email = this.updateForm.value.emails.email;
		this.user.permissions = this.updateForm.value.permissions;

		this.updateUser(this.user);
	}

	private updateUser(user:User) {
		this.usersService.updateUser(user).subscribe(
			_ => {
				this.isUpdating = false;
				this.navigationService.navigateToUser(this.user.mrn);
			},
			err => {
				this.isUpdating = false;
				this.notifications.generateNotification('Error', 'Error when trying to update user', MCNotificationType.Error, err);
			}
		);
	}

	private loadUser() {
		this.isLoading = true;
		let mrn = this.activatedRoute.snapshot.params['id'];
		this.usersService.getUser(mrn).subscribe(
			user => {
				this.user = user;
				this.generateForm();
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.notifications.generateNotification('Error', 'Error when trying to get the user', MCNotificationType.Error, err);

				this.navigationService.navigateToUser(mrn);
			}
		);
	}

	private generateForm() {
		this.updateForm = this.formBuilder.group({});
		this.formControlModels = [];

		var formControlModel:McFormControlModel = {formGroup: this.updateForm, elementId: 'mrn', controlType: McFormControlType.Text, labelName: 'MRN', placeholder: '', isDisabled: true};
		var formControl = new FormControl(this.user.mrn, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'firstName', controlType: McFormControlType.Text, labelName: 'First Name', placeholder: 'First Name is required', validator:Validators.required};
		formControl = new FormControl(this.user.firstName, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		formControlModel = {formGroup: this.updateForm, elementId: 'lastName', controlType: McFormControlType.Text, labelName: 'Last Name', placeholder: 'Last Name is required', validator:Validators.required};
		formControl = new FormControl(this.user.lastName, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);

		McUtils.generateEmailConfirmGroup(this.formBuilder, this.updateForm, this.formControlModels, this.user.email);

		formControlModel = {formGroup: this.updateForm, elementId: 'permissions', controlType: McFormControlType.Text, labelName: 'Permissions', placeholder: ''};
		formControl = new FormControl(this.user.permissions, formControlModel.validator);
		this.updateForm.addControl(formControlModel.elementId, formControl);
		this.formControlModels.push(formControlModel);
	}
}
