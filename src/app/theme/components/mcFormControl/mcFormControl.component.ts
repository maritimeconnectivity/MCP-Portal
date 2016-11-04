import {Component, ViewEncapsulation, Input} from '@angular/core';
import {FormGroup, ValidatorFn, AbstractControl} from "@angular/forms";

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
	requireGroupValid?:boolean;
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

	public isValid():boolean {
		let isGroupValid = true;
		if (this.formControlModel.requireGroupValid) {
			isGroupValid = this.formControlModel.formGroup.valid;
		}
		return !this.formControlModel.validator || (this.formControlModel.formGroup.controls[this.formControlModel.elementId].valid && isGroupValid);
	}
}
