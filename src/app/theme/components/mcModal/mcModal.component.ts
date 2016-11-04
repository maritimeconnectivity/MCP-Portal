import {Component, ViewEncapsulation, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {ModalDirective} from 'ng2-bootstrap/ng2-bootstrap';

@Component({
  selector: 'mc-modal',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcModal.html'),
  styles: [require('./mcModal.scss')]
})
export class McModal {
	@ViewChild('confirmModal') public confirmModal:ModalDirective;
	@Input() show:boolean;
  @Input() title:string;
	@Input() description:string;
	@Input() okTitle:string;
	@Input() okClass:string;
	@Input() cancelTitle?:string;
	@Input() cancelClass?:string;
	@Output() onCancel:EventEmitter<any> = new EventEmitter<any>();
	@Output() onOk:EventEmitter<any> = new EventEmitter<any>();

	private isShowing:boolean = false;
  constructor() {
  }

	ngOnChanges() {
		if (this.show && !this.isShowing) {
			this.confirmModal.show();
		}
	}

	public hideConfirmModal():void {
		this.confirmModal.hide();
		this.isShowing = false;
	}

	public ok() {
		this.onOk.emit('');
		this.hideConfirmModal();
	}

	public cancel() {
		this.onCancel.emit('');
		this.hideConfirmModal();
	}
}
