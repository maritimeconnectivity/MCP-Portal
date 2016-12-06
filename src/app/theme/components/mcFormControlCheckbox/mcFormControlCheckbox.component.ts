import {Component, ViewEncapsulation, Input} from '@angular/core';
import {McFormControlModelCheckbox} from "../mcForm/mcFormControlModel";

@Component({
  selector: 'mc-form-control-checkbox',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControlCheckbox.html'),
  styles: [require('./mcFormControlCheckbox.scss')]
})
export class McFormControlCheckbox {
	@Input() formControlModel: McFormControlModelCheckbox;

	public state: boolean;

  constructor() {
  }


	ngOnInit() {
  	this.state = this.formControlModel.state;
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
