import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {MCNotificationsService, MCNotificationType} from "../../shared/mc-notifications.service";

@Component({
  selector: 'my-organization',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: require('./my-organization.html')
})
export class MyOrganization implements OnInit{

  constructor(private notifications: MCNotificationsService) {
  }

  ngOnInit() {
  }

  generateError() {
    this.notifications.generateNotification({title:'Title', message:'Message', type:MCNotificationType.Error});
    //
  }

}
