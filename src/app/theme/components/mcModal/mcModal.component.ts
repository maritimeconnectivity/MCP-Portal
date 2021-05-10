import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

@Component({
    selector: 'mc-modal',
    encapsulation: ViewEncapsulation.None,
    template: require('./mcModal.html'),
    styles: [require('./mcModal.scss')]
})
export class McModal {
    @ViewChild('confirmModal') public confirmModal: ModalDirective;
    @Input() show: boolean;
    @Input() title: string;
    @Input() description: string;
    @Input() okTitle: string;
    @Input() okClass: string;
    @Input() cancelTitle?: string;
    @Input() cancelClass?: string;
    @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() onOk: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

    // is set to true when we are still doing something to make sure that we don't shut down
    private transitioning: boolean;

    constructor() {
    }

    ngOnInit() {
        this.confirmModal.onHide.subscribe(() => {
            if (this.show && !this.transitioning) {
                this.onClose.emit('');
            }
        });
    }

    ngOnChanges() {
        if (this.show) {
            this.confirmModal.show();
        }
    }

    public hideConfirmModal(): void {
        this.confirmModal.hide();
    }

    public ok() {
        this.onOk.emit('');
        this.transitioning = true;
        this.hideConfirmModal();
    }

    public cancel() {
        this.onCancel.emit('');
        this.transitioning = true;
        this.hideConfirmModal();
    }

    public close() {
        this.onClose.emit('');
        this.hideConfirmModal();
    }
}
