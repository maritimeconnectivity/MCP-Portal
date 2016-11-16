import {FormGroup, ValidatorFn} from "@angular/forms";

export enum McFormControlType {
	Text,
	Checkbox
}

export interface McFormControlModel {
	labelName: string;
	controlType: McFormControlType;
	elementId: string;
	placeholder?: string;
	validator?: ValidatorFn;
	formGroup: FormGroup;
	errorText?: string;
	pattern?: string;
	isDisabled?:boolean;
	requireGroupValid?:boolean;
}