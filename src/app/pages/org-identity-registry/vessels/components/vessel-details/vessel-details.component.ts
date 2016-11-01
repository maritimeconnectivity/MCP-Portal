import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'vessel-details',
  encapsulation: ViewEncapsulation.None,
  template: require('./vessel-details.html'),
  styles: []
})
export class VesselDetailsComponent {
  public title:string;

  constructor() {

  }

  ngOnInit() {
    // TODO change
    this.title = "Vessel Details"
  }
}
