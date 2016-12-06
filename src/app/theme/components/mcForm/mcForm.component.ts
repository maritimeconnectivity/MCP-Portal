import {Component, ViewEncapsulation, Input, EventEmitter, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {McFormControlModel, McFormControlType} from "./mcFormControlModel";

@Component({
  selector: 'mc-form',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcForm.html'),
  styles: [require('./mcForm.scss')]
})
export class McForm {
	@Input() hideButtons:boolean = false;
	@Input() formControlModels: Array<McFormControlModel>;
	@Input() formGroup: FormGroup;
	@Input() isLoading:boolean;
	@Input() isRegistering:boolean;
	@Input() registerTitle:string;
	@Output() onRegister: EventEmitter<any> = new EventEmitter<any>();
	@Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

	public registerFunc: Function;
  constructor() {
  }

	ngOnInit() {
		this.registerFunc = this.register.bind(this);
	}

	public register() {
		this.onRegister.emit('');
	}

	public cancel() {
		this.onCancel.emit('');
	}

	public isControlTypeText(formControlModel:McFormControlModel) {
		return formControlModel.controlType === McFormControlType.Text;
	}

	public isControlTypeCheckbox(formControlModel:McFormControlModel) {
		return formControlModel.controlType === McFormControlType.Checkbox;
	}

	public isControlTypeSelect(formControlModel:McFormControlModel) {
		return formControlModel.controlType === McFormControlType.Select;
	}
}
