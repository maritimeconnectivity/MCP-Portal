import {Component, ViewEncapsulation, Input} from '@angular/core';
import {McFormControlModel} from "../mcForm/mcFormControlModel";

@Component({
  selector: 'mc-form-control-checkbox',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControlCheckbox.html'),
  styles: [require('./mcFormControlCheckbox.scss')]
})
export class McFormControlCheckbox {
	@Input() formControlModel: McFormControlModel;

	public state: boolean;

  constructor() {
	  this.state = false;
  }


	ngOnInit() {
	}

	public onChange(value: any): void {
		this.state = value;
	}

	public isValid():boolean {
		let isGroupValid = true;
		if (this.formControlModel.requireGroupValid) {
			isGroupValid = this.formControlModel.formGroup.valid;
		}
		return !this.formControlModel.validator || (this.state && isGroupValid);
	}
}
