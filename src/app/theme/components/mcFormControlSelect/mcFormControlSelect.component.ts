import {Component, ViewEncapsulation, Input} from '@angular/core';
import {McFormControlModelSelect, SelectModel} from "../mcForm/mcFormControlModel";

@Component({
  selector: 'mc-form-control-select',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControlSelect.html'),
	styles: [require('./mcFormControlSelect.scss')]
})
export class McFormControlSelect {
	@Input() formControlModel: McFormControlModelSelect;

	public selectedValue:string;

  constructor() {
  }


	ngOnInit() {
	}

	public isValid():boolean {
		var isSelected = this.selectedValue !== undefined;
		if (isSelected) {
			isSelected = this.selectedValue.toLowerCase().indexOf('undefined') < 0;
		}
		let isGroupValid = true;
		if (this.formControlModel.requireGroupValid) {
			isGroupValid = this.formControlModel.formGroup.valid;
		}
		return !this.formControlModel.validator || (isSelected && isGroupValid);
	}
}
