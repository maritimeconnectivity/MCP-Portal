import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from "rxjs";

export interface EntityImageModel {
	imageSourceObservable:Observable<string>;
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
	public imageSource:string;
  constructor() {
  }

	ngOnInit() {
		this.imageClass = '';
		if (this.entityImage.isAdd) {
			this.imageClass = 'entity-image-add';
			this.imageSource = 'assets/img/add.png';
		} else {
			this.entityImage.imageSourceObservable.subscribe(
				source => {
					this.imageSource = source;
				},
				err => {
				}
			);
		}
	}
}
