import {Component, ViewEncapsulation, Input, EventEmitter, Output} from '@angular/core';
import {FormGroup, AbstractControl} from "@angular/forms";
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
	@Input() formNeedsUpdating:boolean = false;
	@Output() onRegister: EventEmitter<any> = new EventEmitter<any>();
	@Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

	private initialFormString: string;
	private disableRegisterButton:boolean = false;

	public registerFunc: Function;
  constructor() {
  }

	ngOnInit() {
		this.registerFunc = this.register.bind(this);
	}

	ngOnChanges() {
		if (this.formGroup) {
			if (!this.initialFormString) {
				let formObj = this.formGroup.value;
				let initialSerializedForm = JSON.stringify(formObj);
				this.initialFormString = initialSerializedForm;
			}
			this.checkFormChanged();
			this.formGroup.valueChanges.subscribe(data => {
				this.checkFormChanged();
			});
		}
	}

	private checkFormChanged() {
		let formObj = this.formGroup.value;
		let serializedForm = JSON.stringify(formObj);
		var isUnchanged = serializedForm.split('null').join('\"\"') === this.initialFormString.split('null').join('\"\"');

		this.disableRegisterButton = isUnchanged && this.formNeedsUpdating;
	}

	public register() {
		this.onRegister.emit('');
	}

	public cancel() {
		this.onCancel.emit('');
	}

	public disableRegister() {
  	return this.disableRegisterButton;
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
