import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AuthPermission, AuthService } from "../../../authentication/services/auth.service";

@Component({
  selector: 'mc-create-button',
  styles: [],
  template: require('./mcCreateButton.html'),
  encapsulation: ViewEncapsulation.None
})
export class McCreateButton {
  @Input() title:string;
  @Input() onClick:Function;
  constructor(private authService: AuthService) {
  }
  private isAdmin():boolean {
    return this.authService.authState.hasPermission(AuthPermission.OrgAdmin);
  }

  private clickHandler() {
    this.onClick();
  }
}
