import {Component, ViewEncapsulation, Input} from '@angular/core';
import {AuthService} from "../../../authentication/services/auth.service";

@Component({
  selector: 'mc-create-button',
  styles: [],
  template: require('./mcCreateButton.html'),
  encapsulation: ViewEncapsulation.None
})
export class McCreateButton {
  @Input() title:String;
  @Input() onClick:Function;
  constructor(private authService: AuthService) {
  }
  private isAdmin():boolean {
    return this.authService.authState.isAdmin();
  }

  private clickHandler() {
    this.onClick();
  }
}
