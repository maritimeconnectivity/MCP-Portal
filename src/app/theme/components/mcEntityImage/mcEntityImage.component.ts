import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';

export interface EntityImageModel {
	imageSource:string;
	imageClass?:string;
	entityId:string;
	title:string;
	htmlContent?:string;
	isAdd?:boolean;
}

@Component({
  selector: 'mc-entity-image',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcEntityImage.html'),
  styles: [require('./mcEntityImage.scss')]
})
export class McEntityImage {
  @Input() entityImage:EntityImageModel;
	public imageClass:string;
	public imageDivClass:string;
  constructor() {
  }

	ngOnInit() {
		this.imageClass = 'entity-image';
		this.imageDivClass = '';
		if (this.entityImage.isAdd) {
			this.imageClass = 'entity-image-add';
			this.imageDivClass = 'entity-image';
			this.entityImage.imageSource = 'assets/img/add.png';
		}
	}
}
