import { Component, ViewEncapsulation } from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'specification-list',
  encapsulation: ViewEncapsulation.None,
  template: require('./specification-list.html'),
  styles: []
})
export class SpecificationListComponent {
  constructor(private route: ActivatedRoute, private router: Router) {
  }

  generate() {
    this.router.navigate(['1'], {relativeTo: this.route })
    //
  }
}
