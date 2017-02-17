import {FormGroup, ValidatorFn} from "@angular/forms";

export enum McFormControlType {
	Text,
	TextArea,
	Checkbox,
	Select,
	Datepicker
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
	showCheckmark:boolean;
}
export interface McFormControlModelDatepicker extends McFormControlModel {
	minDate:Date;
}
export interface McFormControlModelCheckbox extends McFormControlModel {
	state:boolean;
}