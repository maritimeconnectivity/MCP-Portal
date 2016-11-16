import {Component, ViewEncapsulation, Input} from '@angular/core';
import {McFormControlModel} from "../mcForm/mcFormControlModel";

@Component({
  selector: 'mc-form-control-text',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControlText.html'),
  styles: [require('./mcFormControlText.scss')]
})
export class McFormControlText {
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
