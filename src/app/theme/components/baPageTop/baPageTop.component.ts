import {Component, ViewEncapsulation, Renderer, ElementRef, ViewChild, Input} from '@angular/core';

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
	@ViewChild('orgnamewrapper') orgNameWrapper: ElementRef;
	@ViewChild('loggedin') loggedIn: ElementRef;
	@ViewChild('logo') logo: ElementRef;

	@Input() organizationName:string;
	public loggedInText = 'Logged in as';
	public orgNameMaxWidth = '1000px';

  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;

  public portalHeadline: string;
  public maritimeCloudHeadline: string;

  constructor(private renderer:Renderer, private _state:GlobalState, private authService: AuthService) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }
	ngAfterViewInit() {
		this.resizeContent();
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

  // Hmmm. probably this can be done in css, but I don't know how
  private resizeContent():void {
	  this.doMinimumResize();
	  // If anything fails, just ignore
	  try {
		  let margin = 15;
		  let logoMaxRight = margin + this.logo.nativeElement.offsetLeft + this.logo.nativeElement.offsetWidth;
		  let orgNameLeft = this.orgNameWrapper.nativeElement.offsetLeft;
		  let orgNameRight = orgNameLeft + this.orgNameWrapper.nativeElement.offsetWidth;
			let orgNameMaxWidth = orgNameRight - logoMaxRight;
		  this.orgNameMaxWidth = orgNameMaxWidth + "px";
	  }catch (error) {
		  console.log(error);
	  }
  }

  private doMinimumResize() {
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
}
