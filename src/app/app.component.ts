import './app.loader.ts';
import {Component, ViewEncapsulation, ViewContainerRef} from '@angular/core';
import { GlobalState } from './global.state';
import { BaImageLoaderService, BaThemePreloader, BaThemeSpinner } from './theme/services';
import { layoutPaths } from './theme/theme.constants';
import {MCNotificationsService, NotificationModel, MCNotificationType} from "./shared/mc-notifications.service";
import {NotificationsService} from "angular2-notifications";
import {NavigationStart, Router} from "@angular/router";
import { AppConfig } from './app.config';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styles: [require('normalize.css'), require('./app.scss')],
  template: `
    <simple-notifications [options]="options"></simple-notifications>
    <main [ngClass]="{'menu-collapsed': isMenuCollapsed}" baThemeRun>
      <div class="additional-bg"></div>
      <router-outlet></router-outlet>
    </main>
  `
})

// TODO: Remove the tooltips. All elements is getting a tooltip with CARD-TITLE

export class App {
  isMenuCollapsed: boolean = false;
  public options = {
    position: ["bottom", "right"],
    timeOut: 10000
  }
  constructor(private viewContainerRef:ViewContainerRef,
              private _state: GlobalState,
              private _imageLoader: BaImageLoaderService,
              private _spinner: BaThemeSpinner,
              private mcNotificationService: MCNotificationsService,
              private notificationService: NotificationsService,
              private router: Router) {

    this._loadImages();

    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });

	  this.router.events.subscribe(event => {
		  if (event instanceof NavigationStart) {
		  	this.mcNotificationService.errorLog = null;
		  }
	  });
    this.mcNotificationService.notifications.subscribe(model => this.generateNotification(model));
  }

  public ngAfterViewInit(): void {
    // hide spinner once all loaders are completed
    BaThemePreloader.load().then((values) => {
      this._spinner.hide();
    });
    
    if (AppConfig.ENVIRONMENT_TEXT != '') {
      document.body.classList.add('test-banner');
      document.body.setAttribute('data-title', AppConfig.ENVIRONMENT_TEXT);
    }
  }

  private _loadImages(): void {
    // register some loaders
    BaThemePreloader.registerLoader(this._imageLoader.load(layoutPaths.images.root + 'sky-bg.jpg'));
  }

  private generateNotification(notificationModel: NotificationModel) {
    switch (notificationModel.type) {
      case MCNotificationType.Error: {
        this.notificationService.error(notificationModel.title, notificationModel.message);
        break;
      }
      case MCNotificationType.Info: {
        this.notificationService.info(notificationModel.title, notificationModel.message);
        break;
      }
      case MCNotificationType.Alert: {
        this.notificationService.alert(notificationModel.title, notificationModel.message);
        break;
      }
      case MCNotificationType.Success: {
        this.notificationService.success(notificationModel.title, notificationModel.message);
        break;
      }
    }
  }
}
