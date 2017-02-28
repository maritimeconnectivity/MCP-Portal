import {Component, ViewEncapsulation} from '@angular/core';
import {SITE_ADMIN_SUB_MENU} from "../app.menu";
import {Route} from "@angular/router";
import * as _ from 'lodash';
import {AuthService} from "../authentication/services/auth.service";
import {OrganizationsService} from "../backend-api/identity-registry/services/organizations.service";
import {MrnHelperService} from "../shared/mrn-helper.service";
import {PAGES_MENU_STM, PAGES_MENU_ALL} from "./pages.menu";

export var PAGES_MENU;
@Component({
  selector: 'pages',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
		<div *ngIf="!showSiteAdminMenu">
    	<ba-sidebar [menuRoutes]="routes"></ba-sidebar>
    </div>
		<div *ngIf="showSiteAdminMenu">
    	<ba-sidebar [menuRoutes]="routes"></ba-sidebar>
    </div>
    <ba-page-top [loggedInName]="loggedInName"></ba-page-top>
    <div class="al-main">
      <div class="al-content">
        <ba-content-top></ba-content-top>
        <router-outlet></router-outlet>
      </div>
    </div>
    <footer class="al-footer clearfix">
      <div class="al-footer-main clearfix">
        <div class="al-copy">Co-Funded by <a href="http://www.cpse-labs.eu/" target="_blank"><img class="al-footer-img" src="{{ ( 'cpse-long.png' | baAppPicture ) }}"></a><a href="http://efficiensea2.org/" target="_blank"><img class="al-footer-img" src="{{ ( 'e2-logo.jpg' | baAppPicture ) }}"></a></div>
      </div>
      <div class="al-footer-right"><a style="color: lightsalmon" href="/#/report"><i style="color: white" class="fa fa-bug" aria-hidden="true"></i> Bug reporting</a> v.{{version}}</div>
    </footer>
    `
})
export class Pages {
	public routes;
	public showSiteAdminMenu = false;
	public loggedInName = "";
	public version = require("../../../package.json").version;

  constructor(private mrnHelper:MrnHelperService, private orgService: OrganizationsService, private authService: AuthService) {
  }

  ngOnInit() {
  	if (this.mrnHelper.isStmOrg()) {
  		PAGES_MENU = PAGES_MENU_STM;
	  } else {
		  PAGES_MENU = PAGES_MENU_ALL;
	  }
	  this.routes = _.cloneDeep(PAGES_MENU);

	  if (this.authService.authState.rolesLoaded) {
		  this.generateSiteAdminMenu();
		  this.loadOrganization();
	  } else {
		  this.authService.rolesLoaded.subscribe((mode)=> {
			  this.generateSiteAdminMenu();
			  this.loadOrganization();
		  });
	  }
	  this.preloadOrganizationNames();
  }

	private loadOrganization() {
		this.orgService.getMyOrganization().subscribe(
			organization => {
				this.loggedInName = organization.name;
				let firstName = this.authService.authState.user.firstName;
				if (firstName) {
					this.loggedInName = firstName + ' - ' + this.loggedInName;
				}
			},
			err => {

			}
		);
	}

	private preloadOrganizationNames() {
		this.orgService.getOrganizationName('').subscribe(
			_ => {

			},
			err => {

			}
		);
	}

  private generateSiteAdminMenu() {
	  if (this.authService.authState.isSiteAdmin()) {
		  this.addRouteToMenuPath(SITE_ADMIN_SUB_MENU, 0, 'pages', this.routes[0]);
		  this.showSiteAdminMenu = true;
	  } else {
		  this.showSiteAdminMenu = false;
	  }
  }

	private addRouteToMenuPath(routeToAdd:Route, childPosition:number, nameOfParent:string, menuRoute: Route):boolean {
		if (menuRoute.path === nameOfParent) {
			if (!menuRoute.children || menuRoute.children.length == 0) {
				menuRoute.children = [routeToAdd];
			} else if (menuRoute.children.length == childPosition) {
				menuRoute.children.push(routeToAdd);
			} else {
				menuRoute.children.splice(childPosition, 0, routeToAdd);
			}
			return true;
		}
		if (menuRoute.children && menuRoute.children.length > 0) {
			var found = false;
			menuRoute.children.forEach(routeChild => {
				if (this.addRouteToMenuPath(routeToAdd, childPosition, nameOfParent, routeChild)) {
					found = true;
				}
			});
			if (found) {
				return true;
			}
		}
		return false;
	}
}
