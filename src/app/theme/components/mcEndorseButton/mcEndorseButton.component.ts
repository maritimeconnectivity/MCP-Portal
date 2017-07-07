import {Component, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {AuthService} from "../../../authentication/services/auth.service";

@Component({
  selector: 'mc-endorse-button',
  styles: [],
  template: require('./mcEndorseButton.html'),
  encapsulation: ViewEncapsulation.None
})
export class McEndorseButton {
	@Input() isEndorsing:boolean;
	@Input() isEndorsedByMyOrg:boolean;
	@Input() title:string = '';
	@Output() onEndorse: EventEmitter<any> = new EventEmitter<any>();

	public endorseButtonClass:string;
	public endorseButtonIcon:string;
	public endorseButtonTitle:string;
	public onClickHandler: Function;
  constructor(private changeDetector: ChangeDetectorRef, private authService: AuthService) {

  }

	ngOnInit() {
		this.onClickHandler = this.onEndorseHandler.bind(this);
		this.setEndorseButtonClassAndTitle();
	}

	ngOnChanges() {
		this.setEndorseButtonClassAndTitle();
		this.changeDetector.detectChanges();
	}

	ngOnDestroy() {
		this.changeDetector.detach();
	}

  public isAdmin():boolean {
    return this.authService.authState.isAdmin();
  }

  public onEndorseHandler() {
    this.onEndorse.emit('');
  }


	private setEndorseButtonClassAndTitle() {
		this.endorseButtonTitle = (this.isEndorsedByMyOrg ? 'Revoke Endorsement' : 'Endorse ' + this.title);
		this.endorseButtonClass = (this.isEndorsedByMyOrg ? 'btn btn-danger btn-raised' : 'btn btn-success btn-raised btn-with-icon');
		this.endorseButtonIcon = (this.isEndorsedByMyOrg ? '' : 'ion-android-cloud-done fa-lg');
	}
}
