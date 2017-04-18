import {Component, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {EntityImageModel} from "../mcEntityImage/mcEntityImage.component";

@Component({
  selector: 'mc-entity-image-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./mcEntityImageList.html'),
  styles: [require('./mcEntityImageList.scss')]
})
export class McEntityImageList {
  @Input() entityImageList: Array<EntityImageModel>;
	@Input() isLoading: boolean;
	@Input() noDataText: string = "No data";
	@Output() onClick: EventEmitter<EntityImageModel> = new EventEmitter<EntityImageModel>();
  constructor() {
  }

  public hasData():boolean {
    return this.entityImageList && this.entityImageList.length > 0;
  }

  public clickedEntity(entityModel:EntityImageModel) {
    this.onClick.emit(entityModel);
  }
}
