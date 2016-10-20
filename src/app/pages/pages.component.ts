import {Component, ViewEncapsulation} from '@angular/core';
@Component({
  selector: 'pages',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: `
    <ba-sidebar></ba-sidebar>
    <ba-page-top></ba-page-top>
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

  constructor() {
  }

  ngOnInit() {
  }
}
