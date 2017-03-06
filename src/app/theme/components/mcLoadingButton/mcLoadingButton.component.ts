import {Component, ViewEncapsulation, Input} from '@angular/core';

@Component({
  selector: 'mc-loading-button',
  styles: [require('./mcLoadingButton.scss')],
  template: require('./mcLoadingButton.html'),
  encapsulation: ViewEncapsulation.None
})
export class McLoadingButton {
  @Input() title:string;
	@Input() class:string;
	@Input() type:string = 'button';
  @Input() isLoading:boolean;
	@Input() disabled:boolean;
  @Input() onClick:Function;
  constructor() {
  }
  private clickHandler() {
    this.onClick();
  }
}
