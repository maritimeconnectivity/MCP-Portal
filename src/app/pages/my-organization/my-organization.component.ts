import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'dashboard',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: require('./my-organization.html')
})
export class MyOrganization {

  constructor() {
  }

}
