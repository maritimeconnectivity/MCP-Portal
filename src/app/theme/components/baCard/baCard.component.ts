import {Component, ViewEncapsulation, ViewChild, Input} from '@angular/core';

@Component({
  selector: 'ba-card',
  styles: [require('./baCard.scss')],
  template: require('./baCard.html'),
  encapsulation: ViewEncapsulation.None
})
export class BaCard {
  @Input() title:String;
	@Input() baCardClass:String;
	@Input() startCollapsed = false;

	private isCollapsed:boolean;
	private collapsedClass:string;
	private toggleClass:string;

	ngOnInit() {
		this.isCollapsed = this.startCollapsed;
		this.setClasses();
	}

	public toggle() {
		this.isCollapsed = !this.isCollapsed;
		this.setClasses();
	}

	private setClasses() {
		this.collapsedClass = this.isCollapsed ? 'collapsed' : '';
		this.toggleClass = this.isCollapsed ? 'fa fa-caret-square-o-down' : 'fa fa-caret-square-o-up';
	}
}
