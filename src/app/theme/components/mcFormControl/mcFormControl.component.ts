import {Component, ViewEncapsulation, Input} from '@angular/core';
import {FormGroup, ValidatorFn} from "@angular/forms";

export interface McFormControlModel {
	labelName: string;
	inputType: string;
	elementId: string;
	placeholder: string;
	validator?: ValidatorFn;
	formGroup: FormGroup;
	errorText?: string;
	pattern?: string;
	isDisabled?:boolean;
}

@Component({
  selector: 'mc-form-control',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControl.html'),
  styles: [require('./mcFormControl.scss')]
})
export class McFormControl {
	@Input() formControlModel: McFormControlModel;
	public pattern:string;

  constructor() {
  }


	ngOnInit() {
		this.pattern = (this.formControlModel.pattern?this.formControlModel.pattern:'.*');
	}
}
