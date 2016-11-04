import {Component, ViewEncapsulation} from '@angular/core';
import {MENU, SITE_ADMIN_SUB_MENU} from "../app.menu";
import {Route} from "@angular/router";
import * as _ from 'lodash';
import {AuthService} from "../authentication/services/auth.service";
import {OrganizationsService} from "../backend-api/identity-registry/services/organizations.service";
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
    <ba-page-top [organizationName]="organizationName"></ba-page-top>
    <div class="al-main">
      <div class="al-content">
        <ba-content-top></ba-content-top>
        <router-outlet></router-outlet>
      </div>
    </div>
    <footer class="al-footer clearfix">
      <div class="al-footer-main clearfix">
        <div class="al-copy">&copy; <a href="http://maritimecloud.net" target="_blank">Maritime Cloud</a> 2016</div>
      </div>
      <div class="al-footer-right"><a style="color: lightsalmon" href="https://github.com/MaritimeCloud/MaritimeCloudPortal/issues" target="_blank"><i style="color: white" class="fa fa-bug" aria-hidden="true"></i> Bug reporting</a></div>
    </footer>
    `
})
export class Pages {
	public routes = _.cloneDeep(MENU);
	public showSiteAdminMenu = false;
	public organizationName = "";

  constructor(private orgService: OrganizationsService, private authService: AuthService) {
  }

  ngOnInit() {
	  if (this.authService.authState.rolesLoaded) {
		  this.generateSiteAdminMenu();
		  this.loadOrganization();
	  } else {
		  this.authService.rolesLoaded.subscribe((mode)=> {
			  this.generateSiteAdminMenu();
			  this.loadOrganization();
		  });
	  }
  }

  private loadOrganization() {
	  this.orgService.getMyOrganization().subscribe(
		  organization => {
			  this.organizationName = organization.name;
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
