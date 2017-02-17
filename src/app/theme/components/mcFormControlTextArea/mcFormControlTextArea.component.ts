import {Component, ViewEncapsulation, Input} from '@angular/core';
import {McFormControlModel} from "../mcForm/mcFormControlModel";

@Component({
  selector: 'mc-form-control-textarea',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControlTextArea.html'),
  styles: [require('./mcFormControlTextArea.scss')]
})
export class McFormControlTextArea {
	@Input() formControlModel: McFormControlModel;

  constructor() {
  }


	ngOnInit() {
	}

	public isValid():boolean {
		let isGroupValid = true;
		if (this.formControlModel.requireGroupValid) {
			isGroupValid = this.formControlModel.formGroup.valid;
		}
		return !this.formControlModel.validator || (this.formControlModel.formGroup.controls[this.formControlModel.elementId].valid && isGroupValid);
	}
}
