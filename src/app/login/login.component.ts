import { Component, OnInit } from '@angular/core';
import {AuthService} from "../authentication/services/auth.service";
import {MCNotificationsService, MCNotificationType} from "../shared/mc-notifications.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-login',
  styles: [require('./login.scss')],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

	public version = require("../../../package.json").version;

  constructor(private authService: AuthService, private notificationService: MCNotificationsService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.route.snapshot.queryParams['reason'] === '401'){
      this.notificationService.generateNotification('Session timeout', 'Your session has timed out', MCNotificationType.Error);
    }
  }

  logIn() {
    this.authService.login();
  }

  isIe():boolean {
	  let userAgent = window.navigator.userAgent;
	  let isIe11 = userAgent.toLowerCase().indexOf('msie') > -1;
	  let isIe12 = userAgent.toLowerCase().indexOf('trident') > -1;
	  let isEdge = userAgent.toLowerCase().indexOf('edge') > -1;
	  return isIe11 || isIe12 || isEdge;
  }

}
