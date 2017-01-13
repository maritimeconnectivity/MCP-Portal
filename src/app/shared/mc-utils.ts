import {FormControl, Validators, FormBuilder, FormGroup} from "@angular/forms";
import {EmailValidator} from "../theme/validators/email.validator";
import {EqualPasswordsValidator} from "../theme/validators/equalPasswords.validator";
import {McFormControlModel, McFormControlType} from "../theme/components/mcForm/mcFormControlModel";
export class McUtils {

	// Generates a group with email equality validation.
	// To get the email call will be formGroup.value.emails.email
	public static generateEmailConfirmGroup(formBuilder:FormBuilder, formGroup: FormGroup, formControlModelsToAdd: Array<McFormControlModel>, defaultEmail?:string) {
		let emails = formBuilder.group({});
		formGroup.addControl('emails', emails);

		let formControlModel:McFormControlModel = {formGroup: emails, elementId: 'email', controlType: McFormControlType.Text, labelName: 'Email', placeholder: 'Email is required', validator:Validators.compose([Validators.required, EmailValidator.validate]), errorText:'Email not valid'};
		let formControlEmail = new FormControl(defaultEmail, formControlModel.validator);
		emails.addControl(formControlModel.elementId, formControlEmail);
		formControlModelsToAdd.push(formControlModel);


		formControlModel = {formGroup: emails, elementId: 'emailConfirm', controlType: McFormControlType.Text, labelName: 'Confirm email', placeholder: '', validator:Validators.required, errorText:'Emails not identical', requireGroupValid:true};
		let formControlEmail2 = new FormControl(defaultEmail);
		emails.addControl(formControlModel.elementId, formControlEmail2);
		formControlModelsToAdd.push(formControlModel);

		emails.setValidators(Validators.compose([Validators.required, EqualPasswordsValidator.validate(formControlEmail, formControlEmail2)]));
	}
}
