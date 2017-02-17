import {Component, ViewEncapsulation, Input, ChangeDetectorRef, ElementRef, ViewChild} from '@angular/core';
import {McFormControlModel, McFormControlModelFileUpload} from "../mcForm/mcFormControlModel";

@Component({
  selector: 'mc-form-control-fileupload',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcFormControlFileUpload.html'),
  styles: [require('./mcFormControlFileUpload.scss')]
})
export class McFormControlFileUpload {
	@Input() formControlModel: McFormControlModelFileUpload;

	public multiple = '';
	public chosenFileValue:string = '';
	public hasChosenFile = false;
	@ViewChild('filePicker') protected _filePicker:ElementRef;

	ngOnInit() {
		this.chosenFileValue = this.formControlModel.placeholder;
		if (this.formControlModel.multipleFiles) {
			this.multiple = 'multiple';
		} else {
			this.multiple = '';
		}
	}


	public uploadFileListener($event) {
		let files = $event.target.files;

		if (files.length) {
			let filesArr = [].slice.call(files);
			this.chosenFileValue = filesArr.map(f => f.name).join(', ');
			this.hasChosenFile = true;
		} else {
			this.resetFileSelection();
		}

		this.formControlModel.formGroup.patchValue({files: files});
	}


	public resetFileSelection() {
		this._filePicker.nativeElement.value = "";
		this.hasChosenFile = false;
		this.chosenFileValue = this.formControlModel.placeholder;
	}

	public isValid():boolean {
		let isGroupValid = true;
		if (this.formControlModel.requireGroupValid) {
			isGroupValid = this.formControlModel.formGroup.valid;
		}
		return !this.formControlModel.validator || (this.formControlModel.formGroup.controls[this.formControlModel.elementId].valid && isGroupValid);
	}
}
