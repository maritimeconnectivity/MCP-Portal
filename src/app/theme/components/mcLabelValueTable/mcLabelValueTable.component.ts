import {Component, ViewEncapsulation, Input} from '@angular/core';
import {isMobile, layoutSizes} from "../../theme.constants";
import {HostListener} from "@angular/core/src/metadata/directives";

export interface LabelValueModel {
  label:string;
  valueHtml:string;
  linkFunction?:Function;
  linkValue?:string;
}

@Component({
  selector: 'mc-label-value-table',
  styles: [],
  template: require('./mcLabelValueTable.html'),
  encapsulation: ViewEncapsulation.None
})
export class McLabelValueTable {
  @Input() labelValues:Array<LabelValueModel>;
  @Input() isLoading:boolean;
  public tableClass:string;
  constructor() {
    this.calculateNameClass();
  }

  @HostListener('window:resize')
  public onWindowResize():void {
    this.calculateNameClass();
  }

  private calculateNameClass():void {
    this.tableClass = (this.isWindowToSmall()?'table-label-value-small':'table-label-value');
  }

  private isWindowToSmall():boolean {
    return window.innerWidth <= layoutSizes.resWidthHideSidebar;
  }
}
