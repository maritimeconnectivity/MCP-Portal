import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';

export interface EntityImageModel {
	imageSource:string;
	imageClass?:string;
	entityId:string;
	title:string;
	htmlContent?:string;
}

@Component({
  selector: 'mc-entity-image',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcEntityImage.html'),
  styles: [require('./mcEntityImage.scss')]
})
export class McEntityImage {
  @Input() entityImage:EntityImageModel;
  constructor() {
  }
}
