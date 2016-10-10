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
        <div class="al-copy">&copy; <a href="http://maritimecloud.net">Maritime Cloud</a> 2016</div>
      </div>
    </footer>
    <ba-back-top position="200"></ba-back-top>
    `
})
export class Pages {

  constructor() {
  }

  ngOnInit() {
  }
}
