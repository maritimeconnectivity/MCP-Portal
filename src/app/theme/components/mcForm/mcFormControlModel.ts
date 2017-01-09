import {FormGroup, ValidatorFn} from "@angular/forms";

export enum McFormControlType {
	Text,
	Checkbox,
	Select
}

export interface SelectModel {
	label:string;
	value:string;
	isSelected:boolean;
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
export interface McFormControlModelSelect extends McFormControlModel {
	selectValues:Array<SelectModel>;
}
export interface McFormControlModelCheckbox extends McFormControlModel {
	state:boolean;
}