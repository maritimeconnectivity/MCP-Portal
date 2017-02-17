import {Component, ViewEncapsulation, Input} from '@angular/core';
import {McFormControlModelDatepicker} from "../mcForm/mcFormControlModel";
import {CalendarModule} from 'primeng/primeng';

@Component({
  selector: 'mc-form-control-datepicker',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControlDatepicker.html'),
	styles: [require('./mcFormControlDatepicker.scss')]
})
export class McFormControlDatepicker {
	@Input() formControlModel: McFormControlModelDatepicker;

	public selectedValue:string;

  constructor() {
  }

	public isValid():boolean {
		let isGroupValid = true;
		if (this.formControlModel.requireGroupValid) {
			isGroupValid = this.formControlModel.formGroup.valid;
		}
		return !this.formControlModel.validator || (this.formControlModel.formGroup.controls[this.formControlModel.elementId].valid && isGroupValid);
	}
}
