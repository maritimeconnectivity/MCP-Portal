import {Component, ViewEncapsulation} from '@angular/core';

import {GlobalState} from '../../../global.state';
import {AuthService} from "../../../authentication/services/auth.service";
import {HostListener} from "@angular/core/src/metadata/directives";
import {layoutSizes} from "../../theme.constants";

@Component({
  selector: 'ba-page-top',
  styles: [require('./baPageTop.scss')],
  template: require('./baPageTop.html'),
  encapsulation: ViewEncapsulation.None
})
export class BaPageTop {

  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;

  public portalHeadline: string;
  public maritimeCloudHeadline: string;

  constructor(private _state:GlobalState, private authService: AuthService) {
    this.resizeContent();
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
  }

  public logout() {
    this.authService.logout();
  }

  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    this.resizeContent();
  }

  private resizeContent():void {
    if (window.innerWidth <= layoutSizes.resWidthMinimum) {
      this.maritimeCloudHeadline = "MC";
      this.portalHeadline = "Portal";
    } else if (window.innerWidth <= layoutSizes.resWidthHideSidebar) {
      this.maritimeCloudHeadline = "Maritime Cloud";
      this.portalHeadline = "Portal";
    } else {
      this.maritimeCloudHeadline = "Maritime Cloud";
      this.portalHeadline = "Management Portal";
    }
  }

  private isWindowToSmall():boolean {
    return window.innerWidth <= layoutSizes.resWidthHideSidebar;
  }
}
