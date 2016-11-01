import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'device-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./device-details.html'),
  styles: []
})
export class DeviceDetailsComponent {
  public title:string;

  constructor() {

  }

  ngOnInit() {
    // TODO change
    this.title = "Device Details"
  }
}
