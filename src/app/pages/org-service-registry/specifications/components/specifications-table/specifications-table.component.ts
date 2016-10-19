import {Component, ViewEncapsulation, Input} from '@angular/core';
import {Specification} from "../../../../../backend-api/service-registry/autogen/model/Specification";
import {HostListener} from "@angular/core/src/metadata/directives";
import {layoutSizes} from "../../../../../theme/theme.constants";

@Component({
  selector: 'specifications-table',
  encapsulation: ViewEncapsulation.None,
  template: require('./specifications-table.html'),
  styles: [require('./specifications-table.scss')]
})
export class SpecificationsTableComponent {
  @Input() specifications: Array<Specification>;
  @Input() isLoading:boolean;
  @Input() onClick:Function;
  private tableNameClass:string;
  constructor() {
    this.calculateNameClass();
  }
  @HostListener('window:resize')
  public onWindowResize():void {
    this.calculateNameClass();
  }

  private calculateNameClass():void {
    this.tableNameClass = (this.isWindowToSmall()?'table-name':'nowrap');
  }

  private isWindowToSmall():boolean {
    return window.innerWidth <= layoutSizes.resWidthCollapseSidebar;
  }

  private clickedRow($event, item) {
    this.onClick(item);
  }
}
